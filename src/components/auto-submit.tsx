import { FC, useEffect } from "react";

type AutoSubmitProps = {
  values: any
  submitForm: () => void
};

const AutoSubmit: FC<AutoSubmitProps> = ({ values, submitForm }) => {
  useEffect(() => {
    submitForm()
  }, [values, submitForm])

  return null
};

export default AutoSubmit;
