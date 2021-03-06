/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import EditPostScreen from "./screens/EditPostScreen";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  EmailVerification:
    | {
        action: string;
      }
    | undefined;
  Root:
    | NavigatorScreenParams<RootTabParamList>
    | {
        params: any;
      }
    | undefined;
  AddPost: undefined;
  ChatConversation: { partnerId: string; contactId: string };
  EditProfile: undefined;
  EditPost: {
    postId: string;
  };
  ProfileViewer: { userId: string };
  Comment: { postId: string };
  Search: undefined;
  BottomNavigation: undefined;
  NotFound: undefined;
};

export type RootTabParamList = {
  NewsFeed: undefined;
  Ranking: undefined;

  Chat: undefined;
  Profile: {
    params: {
      postId: string;
    };
  };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type NavigationLoginProps = NativeStackScreenProps<
  RootStackParamList,
  "Login"
>;

export type NavigationRegisterProps = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

export type NavigationForgotPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  "ForgotPassword"
>;

export type NavigationEmailVerificationProps = NativeStackScreenProps<
  RootStackParamList,
  "EmailVerification"
>;

export type NavigationResetPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  "ResetPassword"
>;

export type NavigationChatConversationProps = NativeStackScreenProps<
  RootStackParamList,
  "ChatConversation"
>;

export type NavigationEditProfileProps = NativeStackScreenProps<
  RootStackParamList,
  "EditProfile"
>;

export type NavigationProfileViewerProps = NativeStackScreenProps<
  RootStackParamList,
  "ProfileViewer"
>;

export type NavigationSearchProps = NativeStackScreenProps<
  RootStackParamList,
  "Search"
>;

export type User = {
  user: {
    id: string;
    email: string;
    username: string;
    bio: string;
    avatar: string;
    following: string;
    followers: string;
    balance_dcoin: number;
    hobbies: string;
  };
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
};
