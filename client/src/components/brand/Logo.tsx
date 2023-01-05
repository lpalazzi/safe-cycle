import React from 'react';
import svg from './logo.svg';

type LogoProps = {
  height?: string | number;
};

export const Logo: React.FC<LogoProps> = (props) => {
  return <img src={svg} height={props.height ?? '100%'} />;
};
