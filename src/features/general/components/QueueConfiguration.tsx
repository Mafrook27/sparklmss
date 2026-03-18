import DraggableConfig from "../ui/DraggableConfig";
import { INITIAL_QUEUES } from "../config/generalconfig";

const QueueConfiguration = () => {
    return (
        <DraggableConfig
            title="Queues Configuration (Drag and Drop)"
            initialData={INITIAL_QUEUES}
            onSave={(data) => console.log("Saving Queue Config:", data)}
            showItemModals
        />
    );
};

export default QueueConfiguration;
