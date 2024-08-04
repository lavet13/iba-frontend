import { useFormikContext } from 'formik';
import { FC, useEffect } from 'react';
import isEqual from 'react-fast-compare';

const AutoSubmit: FC = () => {
  const formik = useFormikContext();

  useEffect(() => {
    if(!isEqual(formik.values, formik.initialValues)) {
      formik.submitForm();
    }
  }, [formik.values]);

  return null;
};

export default AutoSubmit;
