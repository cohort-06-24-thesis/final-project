// import React, { useContext } from 'react';
// import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
// import { NotificationContext } from '../src/context/NotificationContext';

// export default function NotificationScreen() {
//   const { notifications } = useContext(NotificationContext);

//   const renderNotification = ({ item }) => (
//     <View style={styles.notificationCard}>
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.message}>{item.message}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.header}>Notifications</Text>

//       <FlatList
//         data={notifications}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderNotification}
//         contentContainerStyle={notifications.length === 0 && styles.emptyList}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No notifications yet. Stay tuned!</Text>
//         }
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB', // soft off-white background
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#2E4057', // dark blue-gray
//     marginBottom: 20,
//     letterSpacing: 0.5,
//   },
//   notificationCard: {
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 2, // android shadow
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#34495E', // dark slate
//     marginBottom: 6,
//   },
//   message: {
//     fontSize: 14,
//     color: '#7F8C8D', // medium gray
//     lineHeight: 20,
//   },
//   emptyList: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#95A5A6',
//     fontStyle: 'italic',
//   },
// });
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Notification = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Work in progress</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,                 
    justifyContent: 'center',
    alignItems: 'center',   
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Notification;

