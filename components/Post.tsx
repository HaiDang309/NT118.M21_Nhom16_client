import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "./Icon";

import { useState, useEffect } from "react";

import Slider from "@react-native-community/slider";

import { Audio, AVPlaybackStatus } from "expo-av";

const Post = () => {
  const [audioStatus, setAudioStatus] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [durationMillis, setDurationMillis] = useState<number | undefined>(0);
  const [positionMillis, setPositionMillis] = useState<number | undefined>(0);

  const handleChangeAudioStatus = () => {
    setAudioStatus((prev) => !prev);
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setPlaybackStatus(playbackStatus);
    } else {
      setPlaybackStatus(null);
    }
  };

  const loadSound = async () => {
    try {
      const sound = new Audio.Sound();
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await sound.loadAsync(
        require("../assets/sounds/relationship_5188576.mp3")
      );
      setSound(sound);
    } catch (e) {
      console.log(e);
    }
  };

  const playSound = async () => {
    await sound?.playAsync();
  };

  const pauseSound = async () => {
    await sound?.pauseAsync();
  };

  const handleIncrease10Seconds = () => {
    if (playbackStatus?.isLoaded) {
      sound?.setPositionAsync(playbackStatus.positionMillis + 10 * 1000);
    }
  };

  const handleDecrease10Seconds = () => {
    if (playbackStatus?.isLoaded) {
      sound?.setPositionAsync(playbackStatus.positionMillis - 10 * 1000);
    }
  };

  const millisToMinutesAndSeconds = (millis: number = 0) => {
    var minutes = Math.floor(millis / 60000);
    var seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
    if (seconds >= 60) {
      minutes += 1;
      seconds = 0;
    }
    return (
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (seconds < 10 ? "0" : "") +
      seconds
    );
  };

  useEffect(() => {
    loadSound();

    // return () => {
    //   sound?.unloadAsync();
    // };
  }, []);

  useEffect(() => {
    if (audioStatus) {
      playSound();
    } else {
      pauseSound();
    }
  }, [audioStatus]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.header__left}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              overflow: "hidden",
              marginRight: 8,
            }}
          >
            <Image
              style={{ width: "100%", height: "100%" }}
              source={require("../assets/images/274655323_678518986830451_6050520917424346332_n.jpg")}
            />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>haidang_309</Text>
        </View>
        <View style={styles.header__right}>
          <Icon name="ellipsis-horizontal" />
        </View>
      </View>

      <View style={styles.caption}>
        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
      </View>

      <View style={styles.body}>
        <Image
          style={{ width: "50%", height: "100%" }}
          source={require("../assets/images/271321844_1925057337680940_2884675758387849294_n.jpg")}
        />
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
            borderTopColor: "#e5e5e5",
            borderBottomColor: "#e5e5e5",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Recored 1</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
            }}
          >
            <TouchableOpacity onPress={handleDecrease10Seconds}>
              <Icon name="play-back" size={24} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChangeAudioStatus}>
              {!audioStatus ? (
                <Icon
                  name="play-circle"
                  style={{ paddingHorizontal: 16 }}
                  size={48}
                />
              ) : (
                <Icon
                  name="pause-circle"
                  style={{ paddingHorizontal: 16 }}
                  size={48}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleIncrease10Seconds}>
              <Icon name="play-forward" size={24} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: "80%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ marginBottom: 2 }}>
              <Slider
                style={{ width: 200, height: 16 }}
                value={
                  playbackStatus?.isLoaded ? playbackStatus.positionMillis : 0
                }
                minimumValue={0}
                maximumValue={
                  playbackStatus?.isLoaded ? playbackStatus.durationMillis : 0
                }
                minimumTrackTintColor="#00ADB5"
                maximumTrackTintColor="#000"
                onSlidingComplete={async (value) => {
                  sound?.setPositionAsync(value);
                  await sound?.playAsync();
                  handleChangeAudioStatus();
                }}
                onSlidingStart={async () => {
                  await sound?.pauseAsync();
                  handleChangeAudioStatus();
                }}
              />
            </View>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12 }}>
                {millisToMinutesAndSeconds(
                  playbackStatus?.isLoaded ? playbackStatus.positionMillis : 0
                )}
              </Text>
              <Text style={{ fontSize: 12 }}>
                {millisToMinutesAndSeconds(
                  playbackStatus?.isLoaded ? playbackStatus.durationMillis : 0
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 8,
            }}
          >
            <TouchableOpacity>
              <Icon name="heart-outline" size={24} style={{ marginRight: 2 }} />
            </TouchableOpacity>
            <Text style={{ fontWeight: "bold" }}>20</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 8,
            }}
          >
            <TouchableOpacity>
              <Icon
                name="chatbubble-ellipses-outline"
                size={24}
                style={{ marginRight: 2 }}
              />
            </TouchableOpacity>
            <Text style={{ fontWeight: "bold" }}>220</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 8,
            }}
          >
            <Icon name="ear-outline" size={24} style={{ marginRight: 2 }} />
            <Text style={{ fontWeight: "bold" }}>200</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity>
            <Icon
              name="chatbubble-ellipses-outline"
              size={24}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon
              name="share-social-outline"
              size={24}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="bookmark-outline" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
    paddingHorizontal: 16,
  },
  header__left: {
    flexDirection: "row",
    alignItems: "center",
  },
  header__right: {},
  caption: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  body: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 20,

    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
});

export default Post;
