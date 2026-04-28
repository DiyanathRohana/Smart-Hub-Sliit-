import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";

function FollowersList() {
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchFollowers();
    fetchUsername();
  }, [userId, navigate]);

  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`${API_URL}/follows/followers/${userId}`);
      setFollowers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching followers');
      console.error('Error fetching followers:', error);
      setLoading(false);
    }
  };

  const fetchUsername = async () => {
    try {
      // In a real application, you would have an endpoint to get user details by ID
      // For now, we'll check if it's the current user
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (currentUser.userId === userId) {
        setUsername(currentUser.username);
      } else {
        // Try to get the username from the user profile
        const response = await axios.get(`${API_URL}/profiles/user/${userId}`);
        if (response.data) {
          setUsername(response.data.username || "User");
        }
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setUsername("User");
    }
  };

  const handleFollow = async (followingId, isFollowing) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `${API_URL}/follows/unfollow/follower/${currentUser.userId}/following/${followingId}`
        );
      } else {
        // Follow
        await axios.post(`${API_URL}/follows/follow`, {
          followerId: currentUser.userId,
          followerUsername: currentUser.username,
          followingId: followingId,
          followingUsername: followers.find(f => f.followerId === followingId)?.followerUsername || "User"
        });
      }
      
      // Refresh followers list
      fetchFollowers();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Followers of {username}</h3>
                <Link to={`/profile/${userId}`} className="btn btn-sm btn-light">
                  Back to Profile
                </Link>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {followers.length === 0 ? (
                  <div className="alert alert-info" role="alert">
                    No followers yet.
                  </div>
                ) : (
                  <div className="list-group">
                    {followers.map((follow) => {
                      const currentUser = JSON.parse(localStorage.getItem('user'));
                      const isCurrentUser = currentUser.userId === follow.followerId;
                      const isFollowing = followers.some(f => 
                        f.followerId === currentUser.userId && f.followingId === follow.followerId
                      );
                      
                      return (
                        <div key={follow._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <Link to={`/profile/${follow.followerId}`} className="text-decoration-none">
                              <h5 className="mb-1">{follow.followerUsername}</h5>
                              <small className="text-muted">Following since {new Date(follow.createdAt).toLocaleDateString()}</small>
                            </Link>
                          </div>
                          
                          {!isCurrentUser && (
                            <button 
                              className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                              onClick={() => handleFollow(follow.followerId, isFollowing)}
                            >
                              {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FollowersList;
