import React, { useState } from 'react';

//Redux Imports
import { connect } from 'react-redux';

//Material UI Imports
import { Avatar, Button, Dialog, makeStyles } from '@material-ui/core';

//Style Imports
import '../../../public/style/chooseFile.css';
import { updateImgThunk } from '../../store/actions/userActions/editImg';

const useStyles = makeStyles((theme) => ({
  editAvatar: {
    width: '150px',
    height: '150px',
    alignSelf: 'center',
  },
  buttonChooseFile: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    margin: '1rem',
  },
}));

const ChooseFile = ({
  open,
  close,
  currUser,
  history,
  updateImage,
  imgUrl,
}) => {
  const [newImgUrl, setNewImg] = useState(imgUrl);

  if (!currUser.id) {
    return null;
  }

  const onFileLoad = (file) => {
    if (file.size > 450000) {
      alert('FILE TOO BIG!');
    } else if (file) {
      let fileReader = new FileReader();

      fileReader.addEventListener('load', function () {
        setNewImg(fileReader.result);
      });
      fileReader.readAsDataURL(file);
    }
  };

  const hiddenFileInput = React.useRef(null);

  const handleClick = (evt) => {
    hiddenFileInput.current.click();
  };

  const handleSubmit = async (imgUrl) => {
    const { id } = currUser;
    await updateImage({ id, imgUrl });
    history.push('/home');
  };

  const classes = useStyles();
  return (
    <div>
      <Dialog open={open} onClose={close} fullWidth>
        <div className="choose-file-container">
          <span className="drop-zone__prompt" onClick={handleClick}>
            Drag n drop some files here, or click to select files
          </span>
          <input
            type="file"
            onChange={(evt) => onFileLoad(evt.target.files[0])}
            ref={hiddenFileInput}
            name="myFile"
            className="drop-zone__input"
            accept="image/*"
          />
        </div>
        <Avatar
          className={classes.editAvatar}
          src={!newImgUrl ? imgUrl : newImgUrl}
        />
        <div className={classes.buttonChooseFile}>
          <Button variant="contained" onClick={() => handleSubmit(newImgUrl)}>
            Save!
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setNewImg(imgUrl);
              close();
            }}
          >
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    currUser: state.currUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateImage: ({ id, imgUrl }) => dispatch(updateImgThunk({ id, imgUrl })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFile);
