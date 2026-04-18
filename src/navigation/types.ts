import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  ParentSetup: undefined;
  LinkCode: undefined;
};

export type ChildStackParamList = {
  Home: undefined;
};

export type ParentStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

export type RootStackParamList = AuthStackParamList & ChildStackParamList & ParentStackParamList;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type ChildScreenProps<T extends keyof ChildStackParamList> = NativeStackScreenProps<
  ChildStackParamList,
  T
>;
