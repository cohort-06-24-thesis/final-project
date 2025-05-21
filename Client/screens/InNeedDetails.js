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
  Modal,
  KeyboardAvoidingView,
  Platform,
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
            setModalVisible(false);
            axios
              .put(`${API_BASE}/inNeed/${item.id}`, {
                isDone: true,
                doneReason: fulfilledMessage,
              })
              .then((response) => {
                console.log('Item updated:', response.data);
              })
              .catch((error) => {
                console.error('Error updating item:', error);
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

        const commentData = {
            content: newComment,
            userId: userId,
            inNeedId: item.id
        };

        const response = await axios.post(`${API_BASE}/comment/createComment`, commentData);
        setComments(prev => [response.data, ...prev]);
        setNewComment('');
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
            setComments(prev => prev.filter(comment => comment.id !== commentId));
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

      setComments(prev => prev.map(comment => 
        comment.id === commentId ? {...comment, content: editedContent} : comment
      ));

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
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
              <Image 
                source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/40' }}
                style={styles.currentUserAvatar}
              />
            </TouchableOpacity>
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
                <TouchableOpacity
                  onPress={() => {
                    if (comment.user?.id && comment.user.id.toString() === Uid.toString()) {
                      navigation.navigate('UserProfile');
                    } else if (comment.user?.id) {
                      navigation.navigate('OtherUser', { userId: comment.user.id });
                    } else {
                      Alert.alert("Error", "User ID is missing, cannot navigate to profile.");
                    }
                  }}
                >
                  <Image 
                    source={{ uri: comment.user?.profilePic || 'https://via.placeholder.com/40' }}
                    style={styles.commentAvatar}
                  />
                </TouchableOpacity>
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
        <TouchableOpacity
          onPress={() => {
            if (item.User?.id && item.User.id.toString() === Uid.toString()) {
              navigation.navigate('UserProfile');
            } else if (item.User?.id) {
              navigation.navigate('OtherUser', { userId: item.User.id });
            } else {
              Alert.alert("Error", "User ID is missing, cannot navigate to profile.");
            }
          }}
        >
          <Image
            source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/100' }}
            style={styles.userImage}
          />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => {
              if (item.User?.id && item.User.id.toString() === Uid.toString()) {
                navigation.navigate('UserProfile');
              } else if (item.User?.id) {
                navigation.navigate('OtherUser', { userId: item.User.id });
              } else {
                Alert.alert("Error", "User ID is missing, cannot navigate to profile.");
              }
            }}
          >
            <Text style={styles.userName}>{item?.User?.name || 'Anonymous'}</Text>
          </TouchableOpacity>
         
        </View>

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
              <Text style={{ color: '#dc3545', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 26,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    transform: [{ scale: 1 }],
    width: '100%',
  },
  actionButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  map: {
    flex: 1,
  },
  userContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#EFD13D',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userRating: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  contactButton: {
    backgroundColor: '#EFD13D',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  contactButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#dc3545',
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    width: '92%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  input: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  fulfilledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fulfilledButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalSubmitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: 20,
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 10,
    borderTopColor: '#f1f3f5',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addCommentContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  currentUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    maxHeight: 120,
    paddingRight: 10,
  },
  postButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  commentsList: {
    paddingTop: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f1f3f5',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 6,
    color: '#1a1a1a',
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
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
    color: '#555',
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
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  editInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 12,
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});