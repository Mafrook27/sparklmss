import DraggableConfig from "../ui/DraggableConfig";
import { COLLECTION_AGENT_QUEUES } from "../config/generalconfig";

const CollectionAgentQueueConfiguration = () => {
    return (
        <DraggableConfig
            title="Collection Agent Queues Configuration (Drag and Drop)"
            initialData={COLLECTION_AGENT_QUEUES}
            onSave={(data) => console.log("Saving Collection Agent Queue Config:", data)}
            showItemModals
        />
    );
};

export default CollectionAgentQueueConfiguration;
