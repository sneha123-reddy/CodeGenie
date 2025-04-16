
# Research Paper Notes: DeepSeek-Coder

## Overview

AI is transforming software development, but the dominance of closed-source models limits research and innovation. DeepSeek aims to overcome this by providing open-source, high-performance language models specifically designed for coding.

## DeepSeek-Coder Series

- Collection of open-source code-focused LLMs ranging from 1.3B to 33B parameters.
- Trained from scratch on 2 trillion tokens.
- Supports 87 programming languages, enabling deep understanding of syntax and semantics.
- Designed to automate tasks like code generation and bug detection.

## Key Features

- Implements Fill-In-the-Middle (FIM) strategy for code infilling.
  - Techniques used: Prefix-Suffix-Middle (PSM) and Suffix-Prefix-Middle (SPM).
- DeepSeek-Coder-Base 7B outperforms other open-source models, even surpassing GPT-3.5 Turbo in code tasks.
- Enables context-aware code generation by leveraging cross-file repository-level context.

## Training Dataset

- Size: 798 GB, 603 million files.
- Composition:
  - 85% pure code
  - 10% code-related English natural language
- Sourced from GitHub and StackExchange.
- Data cleaning includes:
  - Rule-based filtering (e.g., line length, character ratios)
  - Dependency parsing to maintain file relationships
  - Repository-level deduplication
  - Quality screening via compiler for syntax correctness and readability

### Top Languages in Dataset
- Java: 148 GB (~18%)
- Python: 120 GB (~15%)
- C++: 90 GB (~11%)

## Model Architecture

- Decoder-only Transformer architecture.
- Uses:
  - Rotary Positional Embedding (RoPE)
  - Grouped Query Attention (GQA)
  - FlashAttention v2
- Tokenizer: Hugging Face (BPE, vocab size: 32,000)
- Optimizer: AdamW (β₁ = 0.9, β₂ = 0.95)
- Trained on NVIDIA A100 & H800 GPUs.

## DeepSeek-Coder-Instruct

- Instruction-tuned variant of DeepSeek-Coder.
- Trained with high-quality instructional data.
- Can handle multi-turn prompts and provide enhanced code explanations and improvements.

### Example:
- Base: Generates snake game code.
- Instruct: Adds enhancements like scoring system.

## DeepSeek-Coder v1.5

- Further trained using an additional 2 trillion tokens.
- Improves performance in natural language understanding and mathematical reasoning.
- Enhanced across programming, math, and NL benchmarks.

## Conclusion

DeepSeek-Coder bridges the performance gap between open- and closed-source models in code intelligence. With repository-level pretraining, long-context support, and open licensing, it promotes accessibility and innovation in AI-powered software development.

GitHub: https://github.com/deepseek-ai/DeepSeek-Coder
