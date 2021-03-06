import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
} from "react-native";

import {
  TextInput,
  Button,
  Divider,
  HelperText,
  Snackbar,
  Title,
} from "react-native-paper";

import { Icon, GGButton } from "../components";

import { NavigationResetPasswordProps } from "../types";

import { useFormik, Form, FormikProvider } from "formik";

import { useAppDispatch } from "../app/hook";
import { SET_USER } from "../features/UserSlice";

import * as Yup from "yup";
import { REQUEST } from "../utils";

import * as AUTH_CONSTANT from "../constants/Auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

const BORDER_RADIUS = 8;
const BORDER_COLOR = "#e5e5e5";
const PRIMARY_COLOR = "#00ADB5";

export default function ResetPasswordScreen({
  navigation,
}: NavigationResetPasswordProps) {
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState("");

  const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required(AUTH_CONSTANT.REQUIRED_PASSWORD)
      .min(8, AUTH_CONSTANT.MIN_LENGTH_PASSWORD)
      .matches(
        /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
        AUTH_CONSTANT.ALPHANUMERIC_PASSWORD
      ),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password"), null],
      AUTH_CONSTANT.MUST_MATCHED_CONFIRM_PASSWORD
    ),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      try {
        setError("");
        const _email = await AsyncStorage.getItem("@email/retrieve-password");
        const dataToSend = {
          email: _email,
          password: values.password.trim(),
        };
        const res = await REQUEST({
          method: "POST",
          url: "/auth/reset-password",
          data: dataToSend,
        });

        if (res && res.data.result) {
          await AsyncStorage.removeItem("@email/retrieve-password");
          navigation.navigate("Login");
        }
      } catch (err) {
        setError(err?.response?.data?.message);
      }
    },
  });

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    handleBlur,
    handleChange,
    getFieldProps,
  } = formik;

  const handleToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSignInWithGG = async () => {
    console.log("logged in");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          borderStartColor: "#fff",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ScrollView>
          <View style={styles.container}>
            <View style={{ alignItems: "center" }}>
              <Image
                source={require("../assets/images/reset-password.png")}
                resizeMode="cover"
              />
            </View>
            <View style={{ justifyContent: "center", marginBottom: 16 }}>
              <Title>{AUTH_CONSTANT.SET_NEW_PASSWORD}</Title>

              <View style={{ marginBottom: 8 }}>
                <TextInput
                  value={values.password}
                  onChangeText={handleChange("password")}
                  placeholder={AUTH_CONSTANT.PASSWORD}
                  label={AUTH_CONSTANT.PASSWORD}
                  mode="outlined"
                  autoComplete="off"
                  outlineColor="#e5e5e5"
                  right={
                    showPassword ? (
                      <TextInput.Icon
                        name="eye-off"
                        color="#999"
                        onPress={handleToggleShowPassword}
                      />
                    ) : (
                      <TextInput.Icon
                        name="eye"
                        color="#999"
                        onPress={handleToggleShowPassword}
                      />
                    )
                  }
                  error={Boolean(errors.password)}
                  style={{ ...styles.input }}
                  secureTextEntry={!showPassword}
                />
                {errors.password?.length && (
                  <HelperText type="error" visible={!!errors.password}>
                    <Text>{errors.password}</Text>
                  </HelperText>
                )}
              </View>

              <View style={{ marginBottom: 8 }}>
                <TextInput
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  placeholder={AUTH_CONSTANT.CONFIRM_PASSWORD}
                  label={AUTH_CONSTANT.CONFIRM_PASSWORD}
                  mode="outlined"
                  autoComplete="off"
                  outlineColor="#e5e5e5"
                  right={
                    showPassword ? (
                      <TextInput.Icon
                        name="eye-off"
                        color="#999"
                        onPress={handleToggleShowPassword}
                      />
                    ) : (
                      <TextInput.Icon
                        name="eye"
                        color="#999"
                        onPress={handleToggleShowPassword}
                      />
                    )
                  }
                  error={Boolean(errors.confirmPassword)}
                  style={{ ...styles.input }}
                  secureTextEntry={!showPassword}
                />
                {errors.confirmPassword?.length && (
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    <Text>{errors.confirmPassword}</Text>
                  </HelperText>
                )}
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Button
                mode="contained"
                disabled={
                  !values.password.length || !values.confirmPassword.length
                }
                loading={isSubmitting}
                onPress={handleSubmit}
                style={{ marginBottom: 8 }}
              >
                {AUTH_CONSTANT.NEXT}
              </Button>
            </View>

            <Text
              style={{
                color: PRIMARY_COLOR,
                textAlign: "center",
                fontWeight: "bold",
              }}
              onPress={() => navigation.navigate("Login")}
            >
              {AUTH_CONSTANT.SIGN_IN}
            </Text>
          </View>

          <Snackbar
            visible={!!error?.length}
            duration={5000}
            onDismiss={() => setError("")}
            style={{
              backgroundColor: "#ff0033",
            }}
          >
            {error}
          </Snackbar>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  logo: {
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
  },
  signInBtn: {
    backgroundColor: PRIMARY_COLOR,
    padding: 8,
    borderRadius: BORDER_RADIUS,
    color: "#ffffff",
    marginBottom: 8,
  },
});
