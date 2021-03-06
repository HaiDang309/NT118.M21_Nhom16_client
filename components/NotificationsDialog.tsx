import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { Avatar, Dialog, Portal, Caption, Badge } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  INotification,
  SET_NOTIFICATIONS,
  UPDATE_NOTIFICATION,
} from "../features/NotificationSlice";
import { REQUEST } from "../utils";
import { ISingleUser, IUser } from "../features/UserSlice";
import { START_LOADING, STOP_LOADING } from "../features/CommonSlice";
import { useDispatch } from "react-redux";
import Icon from "./Icon";
import moment from "moment";
import { USER_SERVICES } from "../services";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { UPDATE_POST } from "../features/PostSlice";
import { useNavigation } from "@react-navigation/native";
import { socket, SocketContext } from "../context/socket";

type PropsNotiItem = {
  id: string;
  userId: string;
  action: string;
  sourcePostId: string;
  createdAt: string;

  navigation: any;
};

const NotiItem = (props: PropsNotiItem) => {
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<ISingleUser | null>(null);
  const [avatar, setAvatar] = useState<any>(null);

  const socket = useContext(SocketContext);

  const loadUser = async () => {
    try {
      const user = await USER_SERVICES.getUserById(props.userId);
      const avatar = await USER_SERVICES.loadAvatar(user);
      setUser(user);
      setAvatar(avatar);
    } catch (e) {
      console.error(e);
    }
  };

  const getActionText = (action: string): { icon: string; color: string } => {
    let result: { icon: string; color: string } = {
      icon: "",
      color: "",
    };
    switch (action) {
      case "Liked":
        Object.assign(result, {
          icon: "heart-sharp",
          color: "red",
        });
        break;
      case "Listened":
        Object.assign(result, {
          icon: "ear-sharp",
          color: "#F9D923",
        });
        break;
      case "Bookmarked":
        Object.assign(result, {
          icon: "bookmark-sharp",
          color: "#000",
        });
        break;
    }
    return result;
  };

  const handleGoToPost = async () => {
    dispatch(
      UPDATE_NOTIFICATION({
        notiId: props.id,
        dataToUpdate: {
          isUnread: true,
        },
      })
    );
    socket.emit("notification:read_notification", { notiId: props.id });
    props.navigation.navigate("Root", {
      screen: "Profile",
      params: {
        postId: props.sourcePostId,
      },
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadUser();
      // getPostById();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={{ marginVertical: 4 }}>
      <TouchableOpacity onPress={handleGoToPost}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginRight: 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {avatar ? (
              <Avatar.Image source={{ uri: avatar }} size={24} />
            ) : (
              <Avatar.Icon icon="person-outline" size={24} />
            )}
          </View>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: -4,

                flexWrap: "wrap",
              }}
            >
              <Text style={{ fontWeight: "bold", marginHorizontal: 2 }}>
                {user && user.username}
              </Text>
              <Text style={{ marginHorizontal: 2 }}>????</Text>
              <Icon
                name={getActionText(props.action).icon}
                color={getActionText(props.action).color}
                style={{ marginHorizontal: 2 }}
              />
              <Text style={{}}>1 b??i vi???t c???a b???n.</Text>
            </View>
            <View>
              <Caption>
                {moment(props.createdAt).format("MMM DD, YYYY HH:mm")}
              </Caption>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

type Props = {
  toggleNotiDialog: boolean;
  setToggleNotiDialog: (v: boolean) => void;
  navigation: any;
};

const NotificationsDialog = (props: Props) => {
  const dispatch = useAppDispatch();

  const state = useAppSelector<RootState>((state) => state);
  const noti = useAppSelector<INotification>((state) => state.notification);
  const isLoading = useAppSelector<boolean>((state) => state.common.loading);
  const USER = useAppSelector<IUser>((state) => state.user);

  const loadNotis = async () => {
    try {
      dispatch(START_LOADING());
      let filters = [];
      filters.push({
        key: "opponent_id",
        operator: "=",
        value: USER.loggedInUser.id,
      });
      const params = {
        filters: JSON.stringify(filters),
        limit: 999,
      };
      const res = await REQUEST({
        method: "GET",
        url: "/notifications",
        params,
      });

      if (res && res.data.result) {
        let temp = res.data.data.results;
        temp = temp.map((item: any) => {
          return {
            id: item.id,
            userId: item.user_id,
            opponentId: item.opponent_id,
            action: item.action,
            sourcePostId: item.source_post_id,
            isUnread: item.is_unread,
            createdAt: item.created_at,
          };
        });
        console.log(temp);
        dispatch(SET_NOTIFICATIONS(temp));
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(STOP_LOADING());
    }
  };

  const getUnreadNotis = createDraftSafeSelector(
    (state: RootState) => state.notification,
    (noti) => {
      return noti.list.filter((o) => o.isUnread);
    }
  );

  const getReadNotis = createDraftSafeSelector(
    (state: RootState) => state.notification,
    (noti) => {
      return noti.list.filter((o) => !o.isUnread);
    }
  );

  useEffect(() => {
    if (!USER.loggedInUser.id) return;
    loadNotis();
  }, [USER.loggedInUser.id]);

  return (
    <View>
      <Portal>
        <Dialog
          visible={props.toggleNotiDialog}
          onDismiss={() => props.setToggleNotiDialog(false)}
        >
          <Dialog.Title>Th??ng b??o</Dialog.Title>
          <Dialog.ScrollArea>
            {isLoading && <ActivityIndicator color="#00adb5" />}
            {noti.list.length > 0 && !isLoading && (
              <SectionList
                sections={[
                  { title: "Ch??a ?????c", data: getUnreadNotis(state) },
                  { title: "???? ?????c", data: getReadNotis(state) },
                ]}
                renderSectionHeader={({ section: { title, data } }) => {
                  return (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={{ marginRight: 8 }}>{title}</Text>
                      <Badge size={20}>{data.length}</Badge>
                    </View>
                  );
                }}
                renderItem={({ item }) => {
                  return (
                    <NotiItem
                      key={item.id}
                      {...item}
                      navigation={props.navigation}
                    />
                  );
                }}
                keyExtractor={(item) => item.id}
              />
            )}
            {noti.list.length === 0 && !isLoading && (
              <View>
                <Text>Kh??ng c?? th??ng b??o n??o c???.</Text>
              </View>
            )}
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </View>
  );
};

export default NotificationsDialog;
