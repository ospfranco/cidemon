import {create} from 'tailwind-rn';
import styles from 'styles.json';
import classNames from 'classnames';

const {tailwind, getColor} = create(styles);

export const cw = getColor;
export const tw = (...styles: any[]) => tailwind(classNames(...styles));
