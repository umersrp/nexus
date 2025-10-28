// Prefer environment variable; fallback can be set here if needed
export const apiUrl =
  (process?.env?.NEXT_PUBLIC_API_BASE_URL || 'http://34.228.198.34:3000')
    .replace(/\/$/, '');

// External AI API URL for vocab generation
export const externalApiUrl =
  (process?.env?.EXTERNAL_API_URL || 'http://34.228.198.34:8000')
    .replace(/\/$/, '');

export const sessionDuration = 20;

export const imageUrl = (url) => '';
export const pdfUrl = (url) => `${apiUrl}/api/pdf/${url}`;

export const BaseURL = (link) => {
  const cleanedLink = `${link}`.replace(/^\//, '');
  return `${apiUrl}/api/v1/${cleanedLink}`;
};

export const apiHeader = (token, isFormData) => {
  if (token && !isFormData) {
    return {
      headers: {
        'Authorization': `Bearer ${token.replace(/^Bearer\s+/i, '')}`,
        'Content-Type': 'application/json',
      },
    };
  }
  if (token && isFormData) {
    return {
      headers: {
        Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}`,
        'Content-Type': 'multipart/form-data',
      },
    };
  }
  if (!token && !isFormData) {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  if (!token && isFormData) {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  }
};

export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const CreateFormData = (data) => {
  const formData = new FormData();
  for (let key in data) {
    if (Array?.isArray(data[key])) {
      data[key]?.map((a) => {
        if (a instanceof File) {
          formData.append(`${key}`, a);
        } else if (typeof a == 'object') {
          formData.append(
            `${key}${data[key]?.length == 1 ? '[]' : ''}`,
            JSON.stringify(a)
          );
        } else {
          formData.append(`${key}`, a);
        }
      });
    } else formData.append(key, data[key]);
  }
  return formData;
};

export var recordsLimit = 20;

export const falsyArray = [
  null,
  undefined,
  '',
  0,
  false,
  NaN,
  'null',
  'undefined',
  'false',
  '0',
  'NaN',
];

export const capitalizeFirstLetter = (l = 'test') =>
  `${l.slice(0, 1)?.toUpperCase()}${l.slice(1)}`;
export const formRegEx = /([a-z])([A-Z])/g;
export const formRegExReplacer = '$1 $2';

export const redirectToSection = (sectionID = 'about') => {
  if (typeof window !== 'undefined') {
    const elem = document.getElementById(sectionID);
    elem?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

export const replaceEmptyValue = (val) => val ?? '---';
