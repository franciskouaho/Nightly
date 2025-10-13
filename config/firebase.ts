import analytics from "@react-native-firebase/analytics";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export const db = firestore();
export const authInstance = auth();
export const analyticsInstance = analytics();
export default firebase;
