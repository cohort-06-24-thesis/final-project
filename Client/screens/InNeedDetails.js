import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';
import axios from "axios";
import io from "socket.io-client";

export default function InNeedDetails({ route, navigation }) {
  const { item } = route.params;
  const [Uid, setUid] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [fulfilledMessage, setFulfilledMessage] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [socket, setSocket] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadUid = async () => {
      const storedUid = await AsyncStorage.getItem('userUID');
      if (storedUid) {
        setUid(storedUid);
      } else {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        navigation.goBack();
      }
    };
    loadUid();
  }, []);
 
  useEffect(() => {
    const checkIfFavorited = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) return;

        const response = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        const favorites = response.data;
        setIsFavorited(favorites.some(fav => fav.inNeedId === item.id));
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkIfFavorited();
  }, [item.id]);

  useEffect(() => {
    const socketInstance = io(API_BASE.replace('/api', ''));
    setSocket(socketInstance);

    socketInstance.emit('join_inNeed', item.id);

    socketInstance.on('new_comment', (comment) => {
      setComments(prev => [comment, ...prev]);
    });

    socketInstance.on('comment_deleted', ({ commentId }) => {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    });

    socketInstance.on('comment_updated', ({ commentId, content }) => {
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? {...comment, content} : comment
      ));
    });

    fetchComments();

    return () => {
      socketInstance.emit('leave_inNeed', item.id);
      socketInstance.disconnect();
    };
  }, [item.id]);

  const fetchComments = async () => {
    try {
        const response = await axios.get(`${API_BASE}/comment/findAllComments`, {
            params: { inNeedId: item.id }
        });
        setComments(response.data);
    } catch (error) {
        console.error('Error fetching comments:', error);
        Alert.alert('Error', 'Failed to fetch comments');
    }
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>InNeed item not found</Text>
      </View>
    );
  }

  const handleFavorite = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUID');
      if (!userId) {
        Alert.alert('Error', 'Please login to manage favorites');
        return;
      }

      if (isFavorited) {
        // Find the favorite first before deleting
        const favoritesResponse = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        const favorite = favoritesResponse.data.find(fav => fav.inNeedId === item.id);
        
        if (favorite) {
          await axios.delete(`${API_BASE}/favourite/deleteFavourite/${favorite.id}`);
          setIsFavorited(false);
          Alert.alert('Success', 'Item removed from wishlist');
        }
      } else {
        // Add to favorites with proper structure
        const response = await axios.post(`${API_BASE}/favourite/createFavourite`, {
          userId,
          inNeedId: item.id, // Use inNeedId instead of itemId
          type: 'inNeed'
        });

        if (response.data) {
          setIsFavorited(true);
          Alert.alert('Success', 'Item added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error managing favorites:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleReport = () => {
    console.log('Report item');
  };

  const handleContact = () => {
    if (item?.User) {
      navigation.navigate('Chat', {
        recipientId: item.User.id,
        recipientName: item.User.name,
        recipientProfilePic: item.User.profilePic,
        itemTitle: item.title,
      });
    } else {
      console.log('User information not available');
    }
  };

  const handleFulfilledSubmit = () => {
    Alert.alert(
      'Confirm Fulfillment',
      'Are you sure you want to mark this request as fulfilled?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
              ;
            setModalVisible(false);
  
            // Make the PUT request to update the item
            axios
              .put(`${API_BASE}/inNeed/${item.id}`, {
                isDone: true,
                doneReason: fulfilledMessage, // Include fulfilled message here
              })
              .then((response) => {
                console.log('Item updated:', response.data);
                // Handle success (e.g., update UI)
              })
              .catch((error) => {
                console.error('Error updating item:', error);
                // Handle error (e.g., show error message)
              });
          },
        },
      ]
    );
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    
    try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) {
            Alert.alert('Error', 'Please login to comment');
            return;
        }

        // Simplify the comment data structure
        const commentData = {
            content: newComment,
            userId: userId,
            inNeedId: item.id
        };

        const response = await axios.post(`${API_BASE}/comment/createComment`, commentData);

        // Update local state with the new comment
        setComments(prev => [response.data, ...prev]);
        setNewComment('');

        // Emit through socket
        socket.emit('post_comment', response.data);

    } catch (error) {
        console.error('Error posting comment:', error);
        Alert.alert('Error', 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
        const response = await axios.delete(`${API_BASE}/comment/delete/${commentId}`);
        
        if (response.data.success) {
            // Update local state to remove the comment
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            
            // Emit delete event through socket
            socket.emit('delete_comment', { 
                commentId, 
                inNeedId: item.id 
            });
        } else {
            Alert.alert('Error', response.data.message);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const response = await axios.put(`${API_BASE}/comment/update/${commentId}`, {
        content: editedContent
      });

      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? {...comment, content: editedContent} : comment
      ));

      // Emit edit event through socket
      socket.emit('edit_comment', {
        commentId,
        inNeedId: item.id,
        content: editedContent
      });

      setEditingComment(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      Alert.alert('Error', 'Failed to update comment');
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? "#FF6B6B" : "#666"} 
              />
              <Text style={[
                styles.actionButtonText,
                isFavorited && { color: "#FF6B6B" }
              ]}>
                Favorite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color="#666" />
              <Text style={styles.actionButtonText}>Report</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() =>
              navigation.navigate('FullScreenMap', {
                latitude: item.latitude,
                longitude: item.longitude,
                title: item.title,
                location: item.location,
              })
            }
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.latitude || 0,
                longitude: item.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: item.latitude || 0,
                  longitude: item.longitude || 0,
                }}
                title={item.title}
                description={item.location}
              />
            </MapView>
          </TouchableOpacity>
          
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsCount}>{comments.length} Comments</Text>
          </View>

          <View style={styles.addCommentContainer}>
            <Image 
              source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/40' }}
              style={styles.currentUserAvatar}
            />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              {newComment.trim() && (
                <TouchableOpacity 
                  style={styles.postButton}
                  onPress={handlePostComment}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.commentsList}>
            {comments.map((comment, index) => (
              <View key={comment.id || index} style={styles.commentItem}>
                <Image 
                  source={{ uri: comment.user?.profilePic || 'https://via.placeholder.com/40' }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentUsername}>{comment.user?.name}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                  <View style={styles.commentActions}>
                    <Text style={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                    {comment.userId === Uid && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          onPress={() => {
                            setEditingComment(comment.id);
                            setEditedContent(comment.content);
                          }}
                        >
                          <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <Text style={styles.dotSeparator}>•</Text>
                        <TouchableOpacity 
                          onPress={() => {
                            Alert.alert(
                              'Delete Comment',
                              'Are you sure?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                  text: 'Delete', 
                                  style: 'destructive', 
                                  onPress: () => handleDeleteComment(comment.id) 
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {editingComment === comment.id && (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editedContent}
                        onChangeText={setEditedContent}
                        multiline
                        maxLength={500}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity 
                          onPress={() => {
                            setEditingComment(null);
                            setEditedContent('');
                          }}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleEditComment(comment.id)}
                          style={styles.saveButton}
                        >
                          <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

     
      <View style={styles.userContainer}>
        <Image
          source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/100' }}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item?.User?.name || 'Anonymous'}</Text>
          <Text style={styles.userRating}>⭐ {item?.User?.rating || '0.0'}</Text>
        </View>

        {/* Owner vs Non-owner button */}
        {String(item?.User?.id) !== String(Uid) ? (
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.fulfilledButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.fulfilledButtonText}>Fulfilled</Text>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Fulfilled Modal */}
      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.sectionTitle}>Write how it was fulfilled</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe how your need was met..."
              value={fulfilledMessage}
              onChangeText={setFulfilledMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.modalSubmitButton} 
              onPress={handleFulfilledSubmit}
            >
              <Text style={styles.modalSubmitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 120 },
  imageContainer: { width: '100%', height: 300 },
  image: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 12 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoText: { marginLeft: 8, fontSize: 16, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButton: { alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: '#666', fontSize: 12, marginTop: 4 },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  map: { flex: 1 },
  userContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  userImage: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userRating: { fontSize: 14, color: '#666' },
  contactButton: {
    backgroundColor: '#EFD13D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  contactButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fulfilledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fulfilledButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  modalSubmitButton: {
    backgroundColor: '#4CAF50',  
    paddingVertical: 14,  
    paddingHorizontal: 40,  
    borderRadius: 30,  
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalSubmitButtonText: {
    color: '#fff',  
    fontSize: 16,  
    fontWeight: 'bold',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  addCommentContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    minHeight: 45,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commentInput: {
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    paddingRight: 50,
  },
  postButton: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  commentsList: {
    paddingTop: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commentUsername: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
    color: '#2b2b2b',
  },
  commentText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  deleteText: {
    color: '#dc3545',
  },
  dotSeparator: {
    color: '#ccc',
    marginHorizontal: 4,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  }
});
