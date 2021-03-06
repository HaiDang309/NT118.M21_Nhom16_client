import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  ActivityIndicator,
  Avatar,
  Caption,
  IconButton,
  Title,
} from "react-native-paper";

import EmojiPicker from "rn-emoji-keyboard";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { REQUEST } from "../utils";
import { SocketContext } from "../context/socket";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { IUser } from "../features/UserSlice";
import {
  ADD_MESSAGE,
  CLEAR_MESSAGES,
  IMessenger,
  SET_MESSAGES,
} from "../features/MessengerSlice";

import uuid from "react-native-uuid";
import { USER_SERVICES } from "../services";

const ChatConversation = () => {
  const navigation = useNavigation();
  const route: RouteProp<
    { params: { partnerId: string; contactId: string } },
    "params"
  > = useRoute();

  const flatListRef = useRef<any>(null);
  const layoutRef = useRef<any>(null);

  const socket = useContext(SocketContext);

  const dispatch = useAppDispatch();

  const USER = useAppSelector<IUser>((state) => state.user);
  const messenger = useAppSelector<IMessenger>((state) => state.messenger);

  const [content, setContent] = useState<string>("");
  const [toggleEmojiPicker, setToggleEmojiPicker] = useState<boolean>(false);

  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const loadUser = async () => {
    const _user = await USER_SERVICES.getUserById(route.params?.partnerId);
    const _avatar = await USER_SERVICES.loadAvatar(_user);
    setUser(_user);
    setAvatar(_avatar);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      let _contactIds = [];
      _contactIds.push(USER.loggedInUser.id);
      _contactIds.push(route.params?.partnerId);
      let filters = [];
      filters.push({
        key: "contact_id",
        operator: "=",
        value: _contactIds.sort().join("_"),
      });
      const params = {
        filters: JSON.stringify(filters),
        sortBy: "created_at:desc",
        limit: 15,
      };
      const res = await REQUEST({
        method: "GET",
        url: "/messages",
        params,
      });

      if (res && res.data.result) {
        let temp = res.data.data.results;
        const data = temp
          .map((item: any) => ({
            ...item,
            contactId: item.contactId,
            messageId: item.message_id,
            isUnreadAtTo: item.is_unread_at_to,
          }))
          .slice()
          .reverse();

        dispatch(SET_MESSAGES(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPrivateMessage = async () => {
    try {
      if (messenger.messages.length === 0) {
        let _contactIds = [];
        _contactIds.push(USER.loggedInUser.id);
        _contactIds.push(route.params?.partnerId);
        const data = {
          contact_id: _contactIds.sort().join("_"),
          user_id: USER.loggedInUser.id,
          partner_id: route.params?.partnerId,
        };
        await REQUEST({
          method: "POST",
          url: "/contacts",
          data,
        });
      }
      const dataToSend = {
        messageId: uuid.v4(),
        content,
        from: USER.loggedInUser.id,
        to: route.params?.partnerId,
      };
      socket.emit("messenger:send_private_message", dataToSend);
      dispatch(ADD_MESSAGE(dataToSend));
      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadUser();
      loadMessages();
    }

    return () => {
      isMounted = false;
      dispatch(CLEAR_MESSAGES());
    };
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e5e5",

          padding: 8,
        }}
      >
        <IconButton
          icon="arrow-back"
          size={24}
          onPress={() => navigation.goBack()}
        />
        {user && (
          <>
            {avatar ? (
              <Avatar.Image
                source={{ uri: avatar }}
                size={48}
                style={{ marginRight: 8 }}
              />
            ) : (
              <Avatar.Icon
                icon="person-outline"
                size={48}
                style={{ marginRight: 8 }}
              />
            )}
            <Title>{user.username}</Title>
          </>
        )}
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-end",
          marginHorizontal: 16,

          paddingVertical: 8,
        }}
      >
        {messenger.messages.length > 0 && !loading && (
          <FlatList
            ref={(ref) => (flatListRef.current = ref)}
            onContentSizeChange={() =>
              flatListRef.current.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
            data={messenger.messages}
            keyExtractor={(item, index) => {
              return item.messageId;
            }}
            renderItem={({ item }) => {
              let isFromMe = Boolean(item.from === USER.loggedInUser.id);
              return (
                <View
                  key={item.messageId}
                  style={{
                    alignItems: isFromMe ? "flex-end" : "flex-start",
                  }}
                >
                  {isFromMe ? (
                    <Text
                      style={{
                        backgroundColor: isFromMe ? "#00adb5" : "#000",
                        color: isFromMe ? "#fff" : "#000",

                        padding: 8,
                        marginVertical: 2,

                        borderRadius: 16,

                        maxWidth: "60%",
                      }}
                    >
                      {item.content}
                    </Text>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 2,
                      }}
                    >
                      <Avatar.Icon
                        icon="person-outline"
                        size={32}
                        style={{ marginRight: 4 }}
                      />

                      <Text
                        style={{
                          backgroundColor: "#fff",
                          color: "#000",

                          padding: 8,

                          borderWidth: 1,
                          borderColor: "#e5e5e5",
                          borderRadius: 16,

                          maxWidth: "60%",
                        }}
                      >
                        {item.content}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
        {messenger.messages.length === 0 && !loading && (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Caption>Ch??a c?? tin nh???n n??o.</Caption>
          </View>
        )}
        {loading && (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color="#00adb5" />
          </View>
        )}
      </View>

      <View
        style={{
          margin: 16,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 32,

          padding: 8,

          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          icon="happy-outline"
          size={24}
          color="#ffd233"
          onPress={() => setToggleEmojiPicker(true)}
        />
        <TextInput
          placeholder="Vi???t tin nh???n..."
          value={content}
          onChangeText={setContent}
          onFocus={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({
                animated: true,
              });
            }
          }}
          style={{
            flex: 1,

            backgroundColor: "#fff",
          }}
        />
        <IconButton
          icon="send-sharp"
          size={24}
          onPress={handleSendPrivateMessage}
          disabled={content.length === 0}
          color="#00adb5"
        />
        <EmojiPicker
          enableRecentlyUsed
          onEmojiSelected={(emoji) => setContent((prev) => prev + emoji.emoji)}
          open={toggleEmojiPicker}
          onClose={() => setToggleEmojiPicker(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#fff",

    justifyContent: "space-between",
  },
});

export default ChatConversation;
