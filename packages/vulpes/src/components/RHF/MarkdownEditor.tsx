import { TextFieldProps } from "@mui/material/TextField";
import MDEditor, { MDEditorProps } from "@uiw/react-md-editor";
import {
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

type InputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> &
  Omit<MDEditorProps, "name" | "defaultValue"> & {
    errors: FieldErrors;
  };

/**
 * @param control Estado de controle fornecido pelo hook `useForm`
 * @param name Nome do campo do formulário, usado para registrar o campo
 * @param label Rótulo a se exibido no input
 * @param errors Erros fornecios pelo hook `useForm` (`formState.errors`), o campo que causou o erro será rotulado e marcado em vermelho
 */
const RHFMDEditor = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  errors,
  ...props
}: InputProps<TFieldValues, TName>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={props.rules}
      render={({ field }) => <MDEditor {...field} {...props} />}
    />
  );
};

export default RHFMDEditor;
