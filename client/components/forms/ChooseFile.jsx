import React, { useState } from 'react';

//Redux Imports
import { connect } from 'react-redux';

//Material UI Imports
import { Avatar, Button, Dialog, makeStyles } from '@material-ui/core';

//Style Imports
import '../../../public/style/chooseFile.css';

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
  submit,
  firstName,
  lastName,
  username,
  email,
  imgUrl,
}) => {
  const [newImgUrl, setNewImg] = useState(imgUrl);

  const onFileLoad = (file) => {
    let fileReader = new FileReader();
    if (file.size > 450000) {
      alert('FILE TOO BIG!');
    } else {
      fileReader.onload = () => {
        setNewImg(fileReader.result);
      };
      fileReader.onabort = () => {
        alert('Reading aborted');
      };
      fileReader.onerror = () => {
        alert('Reading error');
      };
    }

    fileReader.readAsDataURL(file);
  };

  const hiddenFileInput = React.useRef(null);

  const handleClick = (evt) => {
    hiddenFileInput.current.click();
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
          <Button
            variant="contained"
            onClick={() =>
              submit(firstName, lastName, username, email, newImgUrl)
            }
          >
            Save!
          </Button>
          <Button variant="contained" onClick={close}>
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default connect()(ChooseFile);
