import React from 'react';
import PropTypes from 'prop-types';
import './Loader.css';

/**
 * Loading spinner component
 */
const Loader = ({ size = 'medium', color = 'primary', fullScreen = false }) => {
  const loaderClasses = [
    'loader',
    `loader-${size}`,
    `loader-${color}`,
    fullScreen ? 'loader-fullscreen' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={loaderClasses}>
      <div className="loader-spinner"></div>
      {fullScreen && <p className="loader-text">Loading...</p>}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  fullScreen: PropTypes.bool
};

export default Loader;
