import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { updateChore } from '../../store/actions/choreActions/updateChore';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CreateIcon from '@material-ui/icons/Create';
import { deleteChore } from '../../store/actions/choreActions/deleteChore';
import { sendNotificationThunk } from '../../store/actions/notificationActions/sendNotification';
import { Button, Checkbox } from '@material-ui/core';
import axios from 'axios';
import 'animate.css';

const ChoreCard = (props) => {
  const [complete, setComplete] = useState(props.chore.isComplete);
  const [dueDate, setDueDate] = useState('');
  const [isParent] = useState(props.user.status === 'Parent');

  useEffect(() => {
    if (!props.chore.isRecurring) {
      const date = new Date(props.chore.due);
      setDueDate(`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`);
    } else {
      props.chore.recurringInterval > 1
        ? setDueDate('Weekly')
        : setDueDate('Daily');
    }
  });

  const today = new Date();
  let expired;
  if (
    props.chore.due &&
    new Date(props.chore.due) < today &&
    !props.chore.isRecurring
  ) {
    expired = true;
  }

  return (
    <div
      className={
        isParent && !expired
          ? 'choreCardParent'
          : !expired
            ? 'choreCard'
            : isParent && expired
              ? 'choreCardParent parentExpiredCard'
              : 'choreCard expiredCard'
      }
    >
      <Checkbox
        className="choreCompletedCheck"
        disabled={props.chore.wasPaid ? true : false}
        checked={complete ? true : false}
        onChange={() => {
          setComplete(!complete);
          if (!complete) {
            if (!isParent) {
              props.parents.map((currParent) => {
                props.sendNotification({
                  text: `${props.chore.name} Completed by ${props.chore.user.username}`,
                  amount: props.chore.amount,
                  isChoreCompleted: true,
                  isChore: true,
                  toId: currParent.id,
                  choreId: props.chore.id,
                });
              });
            }
          }
          props.completeChore(props.chore.id, {
            isComplete: !complete,
          });
        }}
      />
      <img className="choreIcon" src={props.chore.icon} />
      <div className="cardChoreInfo">
        <div>{props.chore.name}</div>
        <small>{props.chore.description}</small>
      </div>
      <div>${props.chore.amount}</div>
      <div className="assignmentContainer">
        <div>{props.chore.user.firstName}</div>
        {!props.chore.isRecurring ? (
          <small>Due: {dueDate}</small>
        ) : (
          <small>{dueDate}</small>
        )}
      </div>
      {isParent ? (
        <div className="editChore">
          <IconButton
            disabled={props.chore.wasPaid ? true : false}
            onClick={() => {
              props.updateClicked(true);
              props.setChore(props.chore);
            }}
          >
            <CreateIcon />
          </IconButton>
          <IconButton onClick={() => props.deleteChore(props.chore.id)}>
            <HighlightOffIcon />
          </IconButton>
          <Button
            disabled={props.chore.wasPaid ? true : false}
            id="payoutButton"
            variant="outlined"
            onClick={async () => {
              await axios.post('/api/stripe/charges', {
                customer: props.user.stripeAccount,
                amount: parseInt(props.chore.amount) * 100,
                kid: props.chore.user.firstName,
              });
              setComplete(true);
              props.updateChore(props.chore.id, {
                isComplete: true,
                wasPaid: true,
              });
            }}
          >
            Payout
          </Button>
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    parents: state.currUser.family?.users.filter(
      (currUser) => currUser.status === 'Parent'
    ),
    user: state.currUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    completeChore: (id, info) => dispatch(updateChore(id, info)),
    deleteChore: (id) => dispatch(deleteChore(id)),
    sendNotification: (message) => dispatch(sendNotificationThunk(message)),
    updateChore: (id, updateInfo) => dispatch(updateChore(id, updateInfo)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChoreCard);
