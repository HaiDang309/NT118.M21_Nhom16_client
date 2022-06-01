import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SectionList,
} from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Avatar,
  Headline,
  Searchbar,
  Title,
  Caption,
  Badge,
} from "react-native-paper";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { REQUEST } from "../utils";

import { useAppDispatch, useAppSelector } from "../app/hook";

import { ISingleUser, IUser } from "../features/UserSlice";
import { SocketContext } from "../context/socket";
import { IMessenger, SET_MESSAGES } from "../features/MessengerSlice";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { USER_SERVICES } from "../services";

type TPropsChatContactItem = ISingleUser & { navigation: any };

const ChatContactItem = (props: TPropsChatContactItem) => {
  const USER = useAppSelector<IUser>((state) => state.user);
  const messenger = useAppSelector<IMessenger>((state) => state.messenger);

  const [avatar, setAvatar] = useState<any>(null);

  const handleGoToChatConversation = async () => {
    let _contactIds = [];
    _contactIds.push(USER.loggedInUser.id);
    _contactIds.push(props.id);
    props.navigation.navigate("ChatConversation", {
      partnerId: props.id,
      contactId: _contactIds.sort().join("_"),
    });
  };

  const getAvatar = async () => {
    const _avatar = await USER_SERVICES.loadAvatar(props);
    setAvatar(_avatar);
  };

  const getUnReadMessages = () => {
    return messenger.messages.reduce((acc, item) => {
      let _contactIds = [];
      _contactIds.push(USER.loggedInUser.id);
      _contactIds.push(props.id);
      if (
        item.contactId === _contactIds.sort().join("_") &&
        item.isUnreadAtTo
      ) {
        acc += 1;
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    getAvatar();
  }, []);

  return (
    <View
      key={props.id}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",

        paddingBottom: 8,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity onPress={handleGoToChatConversation}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold", marginRight: 16 }}>
                {props.username}
              </Text>

              <Caption>Đang hoạt động</Caption>
            </View>

            {getUnReadMessages() > 0 && (
              <View>
                <Badge size={24} style={{ paddingHorizontal: 2 }}>
                  {getUnReadMessages() + " tin nhắn chưa đọc"}
                </Badge>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ChatContactScreen = () => {
  const navigation = useNavigation();

  const socket = useContext(SocketContext);

  const dispatch = useAppDispatch();

  const USER = useAppSelector<IUser>((state) => state.user);

  const [searchValue, setSearchValue] = useState<string>("");
  const [chatContacts, setChatContacts] = useState<ISingleUser[] | null>(null);

  const loadChatContact = async () => {
    let filters = [];
    filters.push({
      key: "_id",
      operator: "not",
      value: USER.loggedInUser.id,
    });
    const params = {
      filters: JSON.stringify(filters),
    };
    try {
      const res = await REQUEST({
        method: "GET",
        url: "/users",
        params,
      });

      if (res && res.data.result) {
        setChatContacts(res.data.data.results);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChatContact();
    }, [])
  );

  return (
    <View style={{ padding: 16, backgroundColor: "#fff", flex: 1 }}>
      <Title style={{ marginBottom: 8 }}>Trò chuyện</Title>

      <Searchbar
        value={searchValue}
        onChangeText={setSearchValue}
        placeholder="Tìm kiếm..."
        style={{ marginBottom: 8 }}
      />

      <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Tin nhắn</Text>

      <View>
        {chatContacts ? (
          <SectionList
            sections={[{ title: "Gợi ý", data: chatContacts }]}
            keyExtractor={(item, index) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <View>
                <Caption>{title}</Caption>
              </View>
            )}
            renderItem={({ item }) => {
              return (
                <ChatContactItem
                  key={item.id}
                  {...item}
                  navigation={navigation}
                />
              );
            }}
          />
        ) : (
          <ActivityIndicator color="#00adb5" />
        )}
      </View>
    </View>
  );
};

export default ChatContactScreen;
