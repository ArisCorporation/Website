import {
  createDirectus,
  rest,
  createItem,
  createItems,
  readItem,
  readItems,
  readSingleton,
  updateItem,
  updateItems,
  deleteItem,
  deleteItems,
  readMe,
  updateMe,
  createUser,
  createUsers,
  readUser,
  readUsers,
  updateUser,
  updateUsers,
  deleteUser,
  deleteUsers,
  createRole,
  createRoles,
  readRole,
  readRoles,
  updateRole,
  updateRoles,
  deleteRole,
  deleteRoles,
  readFile,
  readFiles,
  uploadFiles,
  deleteFile,
  deleteFiles,
  readFolder,
  readFolders,
  createFolder,
  createFolders,
  deleteFolder,
  deleteFolders,
  readFields,
  readField,
  authentication,
  realtime,
} from '@directus/sdk';
// import { useCookie } from '#app';
import type { CMSTypes } from '~/types/cms-types';

export const useCMS = () => {
  const authStore = useAuthStore();

  class CookieStorage {
    get() {
      return {
        expires: authStore.expires,
        refresh_token: authStore.refresh_token,
        access_token: authStore.access_token,
        expires_at: authStore.expires_at,
      };
    }
    set(data) {
      authStore.setData(data);
      // console.log('set_token', data);
    }
  }
  const storage = new CookieStorage();

  function getToken() {
    return {
      expires: authStore.expires,
      refresh_token: authStore.refresh_token,
      access_token: authStore.access_token,
      expires_at: authStore.expires_at,
    };
  }
  // function setToken(data) {
  //   return (useCookie('ams:auth_token').value = data);
  // }

  const directus = createDirectus<CMSTypes>('https://cms.ariscorp.de')
    .with(rest({ credentials: 'include' }))
    .with(authentication('json', { storage }))
    .with(realtime());

  async function signedIn() {
    return (await directus.getToken()) ? true : false;
  }

  // function login(data) {
  //   const { email, password } = data;
  //   const auth_data = directus.request(sdkLogin(email, password));
  //   setToken(auth_data);
  //   return auth_data;
  // }
  // function logout(data) {
  //   directus.request(sdkLogout(data));
  //   setToken(null);
  //   return;
  // }
  // function isLoggedIn(data) {
  //   return getToken() ? true : false;
  // }

  return {
    directus,
    signedIn,
    getToken,
    createItem,
    createItems,
    readItem,
    readItems,
    readSingleton,
    updateItem,
    updateItems,
    deleteItem,
    deleteItems,
    readMe,
    updateMe,
    createUser,
    createUsers,
    readUser,
    readUsers,
    updateUser,
    updateUsers,
    deleteUser,
    deleteUsers,
    createRole,
    createRoles,
    readRole,
    readRoles,
    updateRole,
    updateRoles,
    deleteRole,
    deleteRoles,
    readFile,
    readFiles,
    uploadFiles,
    deleteFile,
    deleteFiles,
    readFolder,
    readFolders,
    createFolder,
    createFolders,
    deleteFolder,
    deleteFolders,
    readFields,
    readField,
  };
};
