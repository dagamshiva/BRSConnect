declare module "react-native-vector-icons/MaterialIcons" {
	import type { Component } from "react";
	import type { TextStyle } from "react-native";

	export interface IconProps {
		name: string;
		size?: number;
		color?: string;
		style?: TextStyle;
	}

	export default class MaterialIcons extends Component<IconProps> {}
}


