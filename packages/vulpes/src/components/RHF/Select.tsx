import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectProps } from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import React from "react";
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
  Omit<SelectProps, "name" | "defaultValue"> & {
    errors: FieldErrors<TFieldValues>;
    label: string;
    formControlProps?: Omit<React.ComponentProps<typeof FormControl>, "error">;
  };

/**
 * @param control Estado de controle fornecido pelo hook `useForm`
 * @param name Nome do campo do formulário, usado para registrar o campo
 * @param label Rótulo a se exibido no input
 * @param errors Erros fornecios pelo hook `useForm` (`formState.errors`), o campo que causou o erro será rotulado e marcado em vermelho
  @description Este componente envelopa um Select do Material UI com um Controller do react-hook-form
*/
const RHFSelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  errors,
  defaultValue,
  formControlProps,
  ...props
}: InputProps<TFieldValues, TName>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={props.rules}
      render={({ field }) => (
        <FormControl {...formControlProps} error={!!errors[name]} fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            label={label}
            {...field}
            {...props}
            onChange={(event, child) => {
              field.onChange(event);
              if (props.onChange) {
                props.onChange(event, child);
              }
            }}
          >
            {props.children}
          </Select>
          {!!errors[name] && (
            <FormHelperText>{errors[name]?.message?.toString()}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default RHFSelect;
