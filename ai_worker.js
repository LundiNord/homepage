import { pipeline, env, TextStreamer} from '/libs/transformerjs/transformers.js';
import '/libs/transformerjs/ort-wasm-simd-threaded.jsep.mjs';

//----------------------------- Ai Setup -----------------------------------
//using https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct

let generator;
env.allowRemoteModels = true;
env.allowLocalModels = false
env.remoteHost= "https://data.nyxnord.de";
//env.localModelPath = '/libs/transformerjs/models/';
env.backends.onnx.wasm.wasmPaths = '/libs/transformerjs/';

async function checkForWebGPU() {
    try {
        if (!navigator.gpu) {
            return false;
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            return false;
        }
        const device = await adapter.requestDevice();
        if (!device) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}
async function loadModel(model = "medium") {
    let modelPath;
    if (model === "medium") {
        //modelPath = "/libs/transformerjs/models/SmolLM2-360M-Instruct";
        modelPath = "models/SmolLM2-360M-Instruct"
    } else if (model === "small") {
        //modelPath = "/libs/transformerjs/models/SmolLM2-135M-Instruct";
        modelPath = "models/SmolLM2-135M-Instruct"
    } else if (model === "big") {
        //modelPath = "/libs/transformerjs/models/SmolLM2-1.7B-Instruct";
        modelPath = "models/SmolLM2-1.7B-Instruct"
    }
    if (await checkForWebGPU()) {
        generator = await pipeline(
            "text-generation",
            modelPath,
            { dtype: "q4", device: 'webgpu', version: "3.4.0"}
        );
        console.log("loaded model with webgpu");
    } else {
        generator = await pipeline(
            "text-generation",
            modelPath,
            { dtype: "q4", version: "3.4.0"}
        );
        console.log("loaded model");
    }
}
//loadModel().then(r => postMessage({ message: "", topic: "loaded"}) );

//----------------------------- Communication -----------------------------------

addEventListener('message', event => {
    const { message, topic } = event.data;
    if (topic === "input") {
        generateAnswer(message);
    } else if (topic === "model") {
        //ToDo fix so not two models can be loaded at the same time
        loadModel(message).then(r => postMessage({ message: "", topic: "loaded"}) );
    }
});

//----------------------------- Ai Generation -----------------------------------
let message = [
    { role: "system", content: "You are a helpful assistant." },
];

let isGenerating = false;
async function generateAnswer(input) {
    if (isGenerating || !input || !generator) return;
    isGenerating = true;
    let fullResponse = '';
    try {
        message.push({ role: "user", content: input });
        const streamer = new TextStreamer(generator.tokenizer, {
            skip_prompt: true,
            callback_function: (text) => {
                fullResponse += text;
                postMessage({ message: fullResponse, topic: "output"});
            },
        });
        const output = await generator(message, {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            streamer,
        });
    } catch (error) {
        console.error("Error generating response:", error);
    } finally {
        isGenerating = false;
        message.push({ role: "system", content: fullResponse });
    }
}
