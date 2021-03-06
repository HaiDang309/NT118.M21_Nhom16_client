import { useCallback, useEffect } from "react";
import { StatusBar } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { store } from "./app/store";
import { Provider } from "react-redux";

import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import Icon from "./components/Icon";

import { SocketContext, socket } from "./context/socket";

import { UPDATE_POST } from "./features/PostSlice";

import { useAppDispatch, useAppSelector } from "./app/hook";

import _omit from "lodash/omit";
import { IUser, UPDATE_USER } from "./features/UserSlice";
import { ADD_NOTIFICATION } from "./features/NotificationSlice";
import { DBContext, db } from "./context/db";
import { FOLDERS } from "./context/files";

import * as FileSystem from "expo-file-system";
import { ADD_MESSAGE } from "./features/MessengerSlice";

import { SingletonEventBus } from "./utils/event-bus";

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {}

    interface Theme {}
  }
}

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  const USER = useAppSelector<IUser>((state) => state.user);

  const createRoom = () => {
    if (USER.loggedInUser.id) {
      const dataToSend = {
        userId: USER.loggedInUser.id,
      };
      socket.emit("create_room", dataToSend);
    }
  };

  const getNumLike = (data: any) => {
    const dataToSend = {
      postId: data.postId,
      dataToUpdate: _omit(data, ["postId"]),
    };
    dispatch(UPDATE_POST(dataToSend));
  };

  const getNumListening = (data: any) => {
    const dataToSend = {
      postId: data.postId,
      dataToUpdate: _omit(data, ["postId"]),
    };
    dispatch(UPDATE_POST(dataToSend));
  };

  const handleReceiveNoti = (payload: any) => {
    const { id, user_id, opponent_id, source_post_id, action, is_unread } =
      payload;
    dispatch(
      ADD_NOTIFICATION({
        id,
        userId: user_id,
        opponentId: opponent_id,
        sourcePostId: source_post_id,
        action,
        isUnread: is_unread,
      })
    );
  };

  const handleReceivePrivateMessage = (payload: any) => {
    const { message_id, contact_id, content, from, to, is_unread_at_to } =
      payload;

    const data = {
      messageId: message_id,
      contactId: contact_id,
      content,
      from,
      to,
      isUnreadAtTo: is_unread_at_to,
    };

    dispatch(ADD_MESSAGE(data));
  };

  const createPostFolders = async () => {
    const postSoundInfo = await FileSystem.getInfoAsync(FOLDERS.POST.SOUNDS);

    if (!postSoundInfo.exists) {
      await FileSystem.makeDirectoryAsync(FOLDERS.POST.SOUNDS, {
        intermediates: true,
      });
    }

    const postThumbnailInfo = await FileSystem.getInfoAsync(
      FOLDERS.POST.THUMBNAILS
    );

    if (!postThumbnailInfo.exists) {
      await FileSystem.makeDirectoryAsync(FOLDERS.POST.THUMBNAILS, {
        intermediates: true,
      });
    }

    const postAvatarInfo = await FileSystem.getInfoAsync(FOLDERS.POST.AVATARS);

    if (!postAvatarInfo.exists) {
      await FileSystem.makeDirectoryAsync(FOLDERS.POST.AVATARS, {
        intermediates: true,
      });
    }

    const userAvatarInfo = await FileSystem.getInfoAsync(FOLDERS.USER.AVATARS);

    if (!userAvatarInfo.exists) {
      await FileSystem.makeDirectoryAsync(FOLDERS.USER.AVATARS, {
        intermediates: true,
      });
    }
  };

  const getNumFollowing = (data: any) => {
    const { num_following } = data;
    dispatch(UPDATE_USER({ following: num_following }));
  };

  const getNumFollowers = (data: any) => {
    const { num_followers } = data;
    SingletonEventBus.getInstance().dispatch<number>(
      "followers",
      num_followers
    );
  };

  useEffect(() => {
    createRoom();
    createPostFolders();

    socket.connect();

    socket.on("messenger:send_private_message", handleReceivePrivateMessage);

    socket.on("notification:send_notification", handleReceiveNoti);

    socket.on("post:num_like", getNumLike);
    socket.on("post:num_listening", getNumListening);

    socket.on("user:num_following", getNumFollowing);
    socket.on("user:num_followers", getNumFollowers);
  }, [USER.loggedInUser.id]);

  if (!isLoadingComplete) {
    return null;
  } else {
    return <Navigation colorScheme={colorScheme} />;
  }
}

export default function AppWrapper() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#00ADB5",
      accent: "#B50800",
      backgroud: "#fff",
      surface: "#fff",
    },
  };
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PaperProvider
          theme={theme}
          settings={{ icon: (props) => <Icon {...props} /> }}
        >
          <SocketContext.Provider value={socket}>
            <DBContext.Provider value={db}>
              <App />
            </DBContext.Provider>
          </SocketContext.Provider>
        </PaperProvider>
      </Provider>

      <StatusBar
        animated={true}
        backgroundColor="#00adb5"
        barStyle="light-content"
        showHideTransition="slide"
      />
    </SafeAreaProvider>
  );
}
