import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { profileService } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, currentUser }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen && currentUser) {
            // Load current profile data
            setFormData({
                displayName: currentUser.displayName || '',
                bio: currentUser.bio || '',
                avatar: currentUser.avatar || ''
            });
        }
    }, [isOpen, currentUser]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('File size must be less than 2MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    avatar: reader.result
                });
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await profileService.updateProfile(formData);
            setSuccess('Profile updated successfully!');

            // Update localStorage with new user data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = {
                ...storedUser,
                displayName: formData.displayName,
                bio: formData.bio,
                avatar: formData.avatar
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Reload page to refresh all user data
            setTimeout(() => {
                window.location.reload();
            }, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-preview-wrapper">
                            <input
                                type="file"
                                id="avatar-file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="avatar-file-input"
                            />
                            <label htmlFor="avatar-file" className="profile-avatar-preview">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {currentUser?.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                            </label>
                            <div className="avatar-edit-overlay">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <Input
                        id="displayName"
                        label="Display Name"
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Enter display name"
                    />

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            rows="4"
                            className="profile-textarea"
                        />
                    </div>

                    {error && <div className="profile-error">{error}</div>}
                    {success && <div className="profile-success">{success}</div>}

                    <div className="modal-actions">
                        <Button type="button" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ProfileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.string,
        username: PropTypes.string,
        displayName: PropTypes.string,
        bio: PropTypes.string,
        avatar: PropTypes.string
    })
};

export default ProfileModal;
