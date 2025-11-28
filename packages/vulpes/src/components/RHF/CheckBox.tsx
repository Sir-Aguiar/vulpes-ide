"use client";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import type { SelectProps } from "@mui/material/Select";
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
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value?: boolean;
    children?: React.ReactNode;
  };

/**
 * @param control Estado de controle fornecido pelo hook `useForm`
 * @param name Nome do campo do formulário, usado para registrar o campo
 * @param label Rótulo a se exibido no input
 * @param errors Erros fornecidos pelo hook `useForm` (`formState.errors`), o campo que causou o erro será rotulado e marcado em vermelho
 * @description Este componente envelopa um Select do Material UI com um Controller do react-hook-form
 */
const RHFCheckBox = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  errors,
  defaultValue,
  formControlProps,
  defaultChecked,
  disabled,
  onChange,
  value,
  children,
  ...props
}: InputProps<TFieldValues, TName>) => {
  const getNestedError = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const error = getNestedError(errors, name);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={props.rules}
      render={({ field }) => (
        <FormControl {...formControlProps} error={!!error} fullWidth>
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                defaultChecked={defaultChecked}
                disabled={disabled}
                checked={value ?? field.value}
                onChange={(e) => {
                  field.onChange(e);
                  if (onChange) {
                    onChange(e);
                  }
                }}
              />
            }
            label={
              <div className="flex items-center">
                {label}
                {children}
              </div>
            }
          />
          {error && (
            <p style={{ color: "#ff0000", fontSize: "13px" }}>
              {String(error.message)}
            </p>
          )}
        </FormControl>
      )}
    />
  );
};

export default RHFCheckBox;
