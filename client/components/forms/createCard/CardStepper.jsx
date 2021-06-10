import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  makeStyles,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
} from '@material-ui/core';

const CardStepper = (props) => {
  const useStyles = makeStyles((theme) => ({
    root: {
      width: '70%',
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  }));

  function getSteps() {
    return [
      'Enter full name as it should appear on card.',
      'Choose your color.',
      'Choose an image.',
    ];
  }

  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [whichStep, setWhichStep] = useState(1);
  const steps = getSteps();

  useEffect(() => {
    if (whichStep !== 1) {
      props.setInputStyle({ ...props.inputStyle, display: 'none' });
    } else {
      props.setInputStyle({ ...props.inputStyle, display: '' });
    }
    if (whichStep !== 2) {
      props.setColorPickerStyle({ display: 'none' });
    } else {
      props.setColorPickerStyle({});
    }
    if (whichStep !== 3) {
      props.setImagesStyle({ display: 'none' });
    } else {
      props.setImagesStyle({});
    }
    if (whichStep === 4 && !props.name.length) {
      setWhichStep(1);
      setActiveStep(0);
    }
    if (whichStep === 4 && props.name.length) props.history.push('/home');
  }, [whichStep]);

  const isStepOptional = (step) => {
    return step === 1 || step === 2;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = async () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    await setActiveStep((prevActiveStep) => prevActiveStep + 1);
    await setSkipped(newSkipped);
  };

  const handleBack = () => {
    setWhichStep(whichStep - 1);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div id="cardStepButtons">
        <div>
          <div>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              className={classes.button}
            >
              Back
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleNext();
                setWhichStep(whichStep + 1);
              }}
              className={classes.button}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardStepper;