import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api/v1";

function FollowingList() {
  const { userId } = useParams();
  const [following, setFollowing] = useState([]);
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

    fetchFollowing();
    fetchUsername();
  }, [userId, navigate]);

  const fetchFollowing = async () => {
    try {
      const response = await axios.get(`${API_URL}/follows/following/${userId}`);
      setFollowing(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching following users');
      console.error('Error fetching following users:', error);
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

  const handleUnfollow = async (followingId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      // Only allow unfollowing if it's the current user's following list
      if (currentUser.userId === userId) {
        await axios.delete(
          `${API_URL}/follows/unfollow/follower/${currentUser.userId}/following/${followingId}`
        );
        
        // Refresh following list
        fetchFollowing();
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
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
                <h3 className="mb-0">Users {username} is Following</h3>
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
                
                {following.length === 0 ? (
                  <div className="alert alert-info" role="alert">
                    Not following anyone yet.
                  </div>
                ) : (
                  <div className="list-group">
                    {following.map((follow) => {
                      const currentUser = JSON.parse(localStorage.getItem('user'));
                      const isCurrentUsersList = currentUser.userId === userId;
                      
                      return (
                        <div key={follow._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <Link to={`/profile/${follow.followingId}`} className="text-decoration-none">
                              <h5 className="mb-1">{follow.followingUsername}</h5>
                              <small className="text-muted">Following since {new Date(follow.createdAt).toLocaleDateString()}</small>
                            </Link>
                          </div>
                          
                          {isCurrentUsersList && (
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleUnfollow(follow.followingId)}
                            >
                              Unfollow
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

export default FollowingList;
