import axios from 'axios';

export const UPDATE_IMAGE = 'UPDATE_IMAGE';

export const updateImg = (updateImg) => ({
  type: UPDATE_IMAGE,
  updateImg,
});

export const updateImgThunk = ({ id, imgUrl }) => {
  return async (dispatch) => {
    try {
      const token = await window.localStorage.getItem('token');
      const { data: updatedImg } = await axios.put(
        `/api/users/image/${id}`,
        {
          imgUrl,
        },
        {
          headers: {
            authorization: token,
          },
        }
      );
      const getUser = (await axios.get(`/api/users/${id}`)).data;
      dispatch(updateImg(getUser));
    } catch (err) {
      console.log(err);
    }
  };
};
