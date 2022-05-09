import { Bucket } from "@util/types";
import { createContext, useContext, useState } from "react";

type ContextValue = {
	keys: Bucket;
};

interface Props {
	data: Bucket;
}

const KeysContext = createContext<ContextValue>(null);
export default () => useContext(KeysContext);

export const KeysProvider: React.FC<Props> = ({ data, children }) => {
	const [keys] = useState(data);

	return <KeysContext.Provider value={{ keys }}>{children}</KeysContext.Provider>;
};
