const llmWorker = require("./llm.worker");

const runWorkers = () => {
    llmWorker()
}

module.exports = runWorkers;