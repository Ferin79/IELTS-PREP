import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Dimensions,
  YellowBox,
  TouchableOpacity,
} from "react-native";
import firebase from "../../data/firebase";
import LoadingScreen from "../components/LoadingScreen";
import { FontAwesome } from "@expo/vector-icons";
import { Context } from "../../data/context";
import { Button, Menu, Divider, Provider } from "react-native-paper";

const Listening = ({ navigation }) => {
  YellowBox.ignoreWarnings(["Setting a timer"]);
  const COLORS = [
    "#ff7979",
    "#fdcb6e",
    "#0984e3",
    "#00b894",
    "#fd79a8",
    "#7ed6df",
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [examSet, setExamSet] = useState([]);
  const [filteredExamSet, setFilteredExamSet] = useState([]);

  // MENU
  const [visible, setVisible] = useState(true);
  const _openMenu = () => {
    setVisible(true);
  };
  const _closeMenu = () => {
    setVisible(false);
  };

  // FILTERS
  const filterVisited = () => {
    const result = examSet.filter((exam) => exam.isVisited === true);
    setFilteredExamSet([...result]);
    setVisible(false);
  };
  // letter summary essay
  const filterTypeLetter = () => {
    const result = examSet.filter((exam) => exam.type === "letter");
    setFilteredExamSet([...result]);
    setVisible(false);
  };
  const filterTypeSummary = () => {
    const result = examSet.filter((exam) => exam.type === "summary");
    setFilteredExamSet([...result]);
    setVisible(false);
  };
  const filterTypeEssay = () => {
    const result = examSet.filter((exam) => exam.type === "essay");
    setFilteredExamSet([...result]);
    setVisible(false);
  };
  const filterNone = () => {
    setFilteredExamSet([...examSet]);
    setVisible(false);
  };

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const SCREEN_WIDTH = Dimensions.get("window").width;

  const { institute_id } = useContext(Context);

  let colorIndex = 0;

  const fetchListeningLists = () => {
    setIsLoading(true);
    firebase
      .firestore()
      .collection("writing")
      .where("institute_id", "==", institute_id)
      .get()
      .then((docs) => {
        let data = [];
        docs.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id, isVisited: false });
        });
        firebase
          .firestore()
          .collection("writingUser")
          .where("email", "==", firebase.auth().currentUser.email)
          .get()
          .then((docs) => {
            if (!docs.empty) {
              docs.forEach((doc) => {
                let givenId = doc.data().writingTestId;
                data.forEach((item, index) => {
                  if (item.id === givenId) {
                    data = data.concat(data.splice(index, 1));
                    item.isVisited = true;
                    item.prevBand = doc.data().band;
                  }
                });
              });
            }
            setExamSet([...data]);
            setFilteredExamSet([...data]);
            setIsLoading(false);
          });
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchListeningLists();
  }, []);

  if (isLoading) {
    return <LoadingScreen text="Loading Test" />;
  }
  return (
    <Provider>
      <SafeAreaView style={{ backgroundColor: "#fff" }}>
        <Menu
          visible={visible}
          onDismiss={_closeMenu}
          anchor={
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <Button
                style={{
                  backgroundColor: "#0af",
                  width: 150,
                  margin: 5,
                }}
                mode="contained"
                onPress={() => {
                  setVisible(true);
                }}
              >
                Filter
              </Button>
              <Text style={{ marginHorizontal: 10, fontSize: 18 }}>
                Total Available Test: {examSet.length}
              </Text>
            </View>
          }
        >
          <Menu.Item onPress={filterTypeSummary} title="Summary" />
          <Menu.Item onPress={filterTypeEssay} title="Essay" />
          <Menu.Item onPress={filterTypeLetter} title="Letter" />
          <Divider style={{ backgroundColor: "#000" }} />
          <Menu.Item onPress={filterVisited} title="Completed" />
          <Menu.Item onPress={filterNone} title="All" />
        </Menu>

        <View
          style={{
            height: SCREEN_HEIGHT * 0.8,
            backgroundColor: "#fff",
            width: SCREEN_WIDTH,
            marginVertical: 20,
          }}
        >
          <FlatList
            data={filteredExamSet}
            keyExtractor={(item) => item.id}
            onRefresh={() => fetchListeningLists()}
            refreshing={isLoading}
            renderItem={({ item }) => {
              if (colorIndex === 6) {
                colorIndex = 0;
              }
              return (
                <TouchableOpacity
                  onPress={() => {
                    const data = examSet.filter((data) => data.id === item.id);
                    navigation.navigate("WritingTest", { data: data[0] });
                  }}
                >
                  <View
                    style={{
                      padding: 40,
                      backgroundColor: item.isVisited
                        ? "lightgrey"
                        : COLORS[colorIndex++],
                      margin: 10,
                      borderRadius: 50,
                    }}
                  >
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          display: "flex",
                          flex: 1,
                          justifyContent: "space-evenly",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 20,
                            marginVertical: 10,
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text style={{ color: "#fff", fontSize: 14 }}>
                          Type:{" "}
                          <Text
                            style={{
                              textTransform: "capitalize",
                              fontWeight: "bold",
                            }}
                          >
                            {item.type}
                          </Text>
                        </Text>
                      </View>
                      <View>
                        <FontAwesome
                          name="pencil-square-o"
                          size={30}
                          color="#fff"
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </Provider>
  );
};

export default Listening;
