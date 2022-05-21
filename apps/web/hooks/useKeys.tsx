import { Drive } from "@prisma/client";
import { createContext, useContext, useState } from "react";

type ContextValue = {
	keys: Drive;
};

interface Props {
	data: Drive;
}

const KeysContext = createContext<ContextValue>(null);
export default () => useContext(KeysContext);

export const KeysProvider: React.FC<Props> = ({ data, children }) => {
	const [keys] = useState(data);

	return <KeysContext.Provider value={{ keys }}>{children}</KeysContext.Provider>;
};
