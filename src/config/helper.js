import moment from 'moment';
import CryptoJS from 'crypto-js';

export const getCalculatedSeconds = (date, mins = 3, pauseTime) => {
  const baseDate = pauseTime
    ? moment()
    : moment(date, 'DD MMM YYYY hh:mm:ss a');

  const endDate = baseDate.clone().milliseconds(mins * 60 * 1000);
  const currentTime = moment(moment().format('DD MMM YYYY hh:mm:ss a'));
  let time = moment(baseDate)
    .milliseconds(endDate.diff(currentTime, 'milliseconds'))
    .valueOf();
  return time;
};

export const checkTimeIsExpire = (date, mins = 3, onExpire) => {
  const baseDate = moment(date, 'DD MMM YYYY hh:mm:ss a');

  const endDate = baseDate.clone().milliseconds(mins * 60 * 1000);

  const currentTime = moment(moment().format('DD MMM YYYY hh:mm:ss a'));
  let time = moment()
    .milliseconds(endDate.diff(currentTime, 'milliseconds'))
    .valueOf();
  if (currentTime?.isBetween(baseDate, endDate)) {
  } else {
  }
  return time;
};

// Encrypting the token
const secretKey = 'your-secret-key'; // Keep this key secure!

export const encryptToken = (token) => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
};

// Decrypting the token
export const decryptToken = (encryptedToken) => {
  try {
    if (!encryptedToken) {
      console.error('No encrypted token provided');
      return null;
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedToken) {
      console.error('Failed to decrypt token - invalid key or corrupted data');
      return null;
    }
    
    return decryptedToken;
  } catch (error) {
    console.error('Token decryption error:', error);
    return null;
  }
};

export const getPreferenceVideo = (pref) => {
  if (pref?.includes('anna')) {
    return '/anna-video.mp4';
  } else {
    return '/james-video.mp4';
  }
};

export const getPreferenceVoice = (pref) => {
  if (pref?.includes('anna')) {
    return 'shimmer'; // coral
  } else {
    return 'ash'; //
  }
};
