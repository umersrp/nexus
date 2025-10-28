"use client";
import Cookies from 'js-cookie';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';

export const logout = async () => {
  const token = Cookies.get('xpdx');
  const headers = apiHeader(token);
  const url = BaseURL('auth/logout');
  await Post(url, {}, headers);
  Cookies.remove('xpdx');
  Cookies.remove('role');
};


