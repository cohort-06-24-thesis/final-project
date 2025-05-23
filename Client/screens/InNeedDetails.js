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
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';
import axios from "axios";
import io from "socket.io-client";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
        const isFav = favorites.some(fav => 
          fav.inNeedId === item.id
        );
        setIsFavorited(isFav);
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
        const favorite = favoritesResponse.data.find(fav => 
          fav.inNeedId === item.id
        );
        
        if (favorite) {
          await axios.delete(`${API_BASE}/favourite/deleteFavourite/${favorite.id}`);
          setIsFavorited(false);
          Alert.alert('Success', 'Item removed from wishlist');
        }
      } else {
        const response = await axios.post(`${API_BASE}/favourite/createFavourite`, {
          userId,
          inNeedId: item.id,
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
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.title}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="info-circle" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>About this request</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity 
              style={[styles.wishlistButton, isFavorited && styles.wishlistButtonActive]} 
              onPress={handleFavorite}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorited ? "#fff" : "#FF6B6B"} 
              />
              <Text style={[
                styles.wishlistButtonText,
                isFavorited && { color: "#fff" }
              ]}>
                {isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="map-marker-alt" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <TouchableOpacity
              style={styles.mapContainer}
              onPress={() => navigation.navigate('FullScreenMap', {
                latitude: item.latitude || 48.8566,
                longitude: item.longitude || 2.3522,
                title: item.title,
                location: item.location,
              })}
            >
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: item.latitude || 48.8566,
                  longitude: item.longitude || 2.3522,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: item.latitude || 48.8566,
                    longitude: item.longitude || 2.3522,
                  }}
                  title={item.title}
                  description={item.location}
                />
              </MapView>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="comments" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
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
        </View>
      </ScrollView>

      {/* Fixed User Details Section */}
      <View style={styles.userContainer}>
        <TouchableOpacity
          onPress={() => {
            if (item?.User?.id && item.User.id.toString() === Uid.toString()) {
              navigation.navigate('UserProfile');
            } else if (item?.User?.id) {
              navigation.navigate('OtherUser', { userId: item.User.id });
            }
          }}
        >
          <Image 
            source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/100' }}
            style={styles.userImage}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            if (String(item?.User?.id) === String(Uid)) {
              navigation.navigate('UserProfile');
            } else {
              navigation.navigate('OtherUser', { userId: item?.User?.id });
            }
          }}
        >
          <Text style={styles.userName}>{item?.User?.name || 'Anonymous'}</Text>
        </TouchableOpacity>
        {String(item?.User?.id) !== String(Uid) ? (
          <TouchableOpacity 
            style={[
              styles.contactButton,
              { backgroundColor: item.isDone ? '#666' : '#EFD13D' }
            ]} 
            onPress={handleContact}
            disabled={item.isDone}
          >
            <View style={styles.buttonContent}>
              <Ionicons 
                name={item.isDone ? "checkmark-circle" : "chatbubble-outline"} 
                size={18} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={styles.contactButtonText}>
                {item.isDone ? 'Request Fulfilled' : 'Contact'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.contactButton,
              { backgroundColor: item.isDone ? '#666' : '#4CAF50' }
            ]}
            onPress={() => setModalVisible(true)}
            disabled={item.isDone}
          >
            <View style={styles.buttonContent}>
              <Ionicons 
                name={item.isDone ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={18} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={styles.contactButtonText}>
                {item.isDone ? 'Request Fulfilled' : 'Mark as Fulfilled'}
              </Text>
            </View>
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
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
  },
  imageContainer: {
    height: 300,
    width: width,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 32,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    letterSpacing: 0.2,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  wishlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginTop: 16,
    alignSelf: 'center',
  },
  wishlistButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  wishlistButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
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
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    paddingVertical: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
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