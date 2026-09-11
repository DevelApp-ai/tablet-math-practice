# **Pedagogical Roadmap & Math Learning Enhancements**

This document outlines architectural recommendations, instructional design improvements, and feature expansions to transition the **Tablet Math Practice** application from a rapid-drill arithmetic engine into a comprehensive, conceptually grounded math learning platform.

## **1\. Pedagogical Foundation: The CPA Framework**

Modern mathematics education emphasizes Bruner’s **Concrete-Pictorial-Abstract (CPA)** progression:

> 1. **Concrete:** Physical or simulated physical interaction with tangible items.  
> 2. **Pictorial (Representational):** Visual models representing mathematical quantities and relationships.  
> 3. **Abstract:** Symbolic representations (e.g., ![][image1]).

Currently, the application focuses almost exclusively on the **Abstract** stage. Introducing integrated pictorial manipulatives and structured scaffolding will support early learners, neurodivergent students, and learners experiencing math anxiety.

## **2\. Visual Manipulatives & Conceptual Scaffolding**

### **2.1. Dynamic Ten-Frames & Number Bonds (Ages 4–8)**

> * **Concept:** Ten-frames anchor numbers to the base-10 system and foster subitizing (recognizing quantities without counting one by one).  
> * **Application Design:**  
  * When solving single-digit addition or subtraction (e.g., ![][image2]), display twin ![][image3] ten-frame grids.  
  * Learners can tap or drag digital counters into the frame.  
  * Visualizing the transition from ![][image4], then adding the remaining ![][image5] to reach ![][image6], solidifies decomposition strategies.

### **2.2. Interactive Number Lines with Jump Arcs**

> * **Concept:** Spatial positioning reinforces quantity comparison, distance, and directionality (negative numbers).  
> * **Application Design:**  
  * An interactive horizontal axis where learners can draw or drag hop curves (![][image7], ![][image8], ![][image9]).  
  * Dynamic highlighting shows the starting operand, the jump magnitude, and the landing coordinate.  
  * Essential for visualizing subtraction as "distance between numbers" rather than merely "taking away."

### **2.3. Area & Array Models for Multiplication and Division**

> * **Concept:** Rote times-table memorization often masks an inability to grasp multiplicative structures.  
> * **Application Design:**  
  * For a problem like ![][image10], render a scalable ![][image11] grid of blocks or dots.  
  * Support distributive decomposition: splitting ![][image11] into ![][image12] with a vertical dividing slider.  
  * For division (![][image13]), allow grouping or partitioning items into equal rows.

### **2.4. Fraction Strips and Sector Visualizers**

> * **Concept:** Fractions require understanding parts of a whole and equivalent proportions.  
> * **Application Design:**  
  * Interactive fraction bars that snap together for visual addition (e.g., ![][image14]).  
  * Circular pie charts with adjustable dividing angles to visualize fraction-to-decimal equivalence.

## **3\. Procedural Scaffolding & Multi-Step Workflows**

### **3.1. Standard Algorithm Vertical Alignment Mode**

> * **Current Limitation:** Problems are presented horizontally (![][image15]), forcing mental arithmetic or chaotic scratchpad usage.  
> * **Enhancement:**  
  * Add a toggle for vertical column presentation:  
    ![][image16]  
  * Provide explicit **carry boxes** above the tens/hundreds columns and **borrow indicator flags** for subtraction.  
  * Enforce column-by-column focus (ones column ![][image17] tens column), giving feedback at each step before moving left.

### **3.2. Long Division & Multi-Digit Multiplication Steps**

> * **Step-by-Step Flow:**  
  * For long division, break the interface into discrete sub-goals: **Divide**, **Multiply**, **Subtract**, and **Bring Down**.  
  * Keep the intermediate steps interactive on the tablet screen with alignment guides so place-value columns never drift.

### **3.3. Multi-Section Canvas (Problem Zone vs. Scratchpad Zone)**

> * **Canvas Architecture:**  
  * Split the tablet view into two defined regions:  
    1. **Formal Workspace:** Where the final answer digits and carry marks are registered.  
    2. **Freeform Scratchpad:** An unconstrained area with zoom/pan capabilities for rough calculations, grouping tallies, or sketches.

## **4\. Diagnostic Error Analysis & Intelligent Feedback**

### **4.1. "Bug Library" Pattern Detection**

Instead of treating wrong inputs as simple failures, classify errors into systematic misconceptions:

> * **Borrow Reversal Error:** In ![][image18], the student calculates ![][image19] and ![][image20] to produce ![][image21].  
> * **Missing Carry / Truncation:** In ![][image22], the student writes ![][image23] (forgetting the regrouped ![][image24]) or ![][image25] (writing both ![][image26] and ![][image27]).  
> * **Sign Confusion:** Multiplying instead of adding (![][image28]).  
> * **Off-by-One / Subitizing Slip:** Input differs by exactly ![][image29].

### **4.2. Tiered Hint Hierarchy**

Replace immediate reveals with progressive hints:

> 1. **Tier 1 (Nudge):** Highlight the relevant column or concept (e.g., *"Take a look at the ones column: does ![][image30] require regrouping?"*).  
> 2. **Tier 2 (Pictorial Aid):** Automatically render the ten-frame or base-10 blocks showing the regrouping process.  
> 3. **Tier 3 (Step-by-Step Walkthrough):** Guide the student through the single operation step, then prompt them to complete the remainder.

## **5\. Memory Retention & Mastery Systems**

### **5.1. The "Mistake Vault" (Spaced Repetition System)**

> * Track historical errors in a persistent queue (localStorage or IndexedDB).  
> * Employ a modified Leitner box or SM-2 algorithm:  
  * Problems failed today reappear at the start of tomorrow’s session.  
  * Problems solved correctly 3 consecutive times graduate out of the review queue.  
> * Include a dedicated **"Remediation Challenge"** game mode where learners clear out their Mistake Vault to earn special badges.

### **5.2. Fluency vs. Accuracy Differentiation**

> * High-stakes timers can provoke math anxiety.  
> * Split practice sessions into two distinct modes:  
  * **Mastery / Exploration Mode:** Untimed, zero pressure, full access to visual manipulatives, hints enabled, focus on deep conceptual accuracy.  
  * **Sprint / Fluency Mode:** Optional short intervals (e.g., 60 seconds) targeting rapid recall of mastered facts (e.g., times tables up to ![][image31]) without carry steps.

## **6\. Relational & Algebraic Thinking**

### **6.1. Variable Placement & Missing Operands**

Transition beyond the format ![][image32]:

> * **Missing Initial Operand:** ![][image33]  
> * **Missing Second Operand:** ![][image34]  
> * **Missing Operator:** ![][image35]

### **6.2. Balance Scale Model**

> * Present equations as a physical balance scale:  
>   ![][image36]  
> * Counters can be added or removed from both sides to introduce algebraic equivalence (![][image37]).

## **7\. Tablet-First & Stylus UX Optimizations**

### **7.1. Stylus Gestures & Ergonomics**

> * **Scratch-Out to Erase:** Drawing a zigzag or cross line over a handwritten number erases only that stroke cluster, mimicking pencil-and-paper muscle memory.  
> * **Palm Rejection Fine-Tuning:** Configure touch event filters to ignore broad capacitive contacts (![][image38] contact radius) when an active stylus pencil point is active.  
> * **Canvas Background Customization:**  
  * Plain white.  
  * Graph/Grid paper (![][image39] or ![][image40] ruled squares) for column arithmetic.  
  * Dotted isometric grid for geometry.  
  * Lined notebook styling.

### **7.2. Step-by-Step Stroke Replay for Educators**

> * Store stroke timestamp sequences alongside completed problems.  
> * Allow parents/teachers to click a "Replay Solution" button to watch the learner's pen order:  
  * Reveals hesitation pauses.  
  * Shows whether the student worked left-to-right or right-to-left.  
  * Highlights scratchpad work that led to the final conclusion.

## **8\. Story Problems & Contextual Mathematics**

### **8.1. Word Problem Generator with Variable Substitution**

> * Math concepts acquire relevance when embedded in real-world narratives:  
  * *"Maya has ![][image41] apples. She gives ![][image42] to Noah and bakes ![][image5] into a pie. How many apples does Maya have left?"*  
> * Parameterize story templates with dynamic nouns, themes (space, animals, cooking), and numbers scaled to the selected difficulty.

### **8.2. Multimodal Accessibility (Text-to-Speech)**

> * Integrate the browser's Web Speech API (window.speechSynthesis) to read story problems aloud in the active locale (en, da, de, ne).  
> * Prevents reading decoding difficulties from obstructing mathematical assessment.

## **9\. Implementation Architecture & Data Model Expansion**

src/  
├── components/  
│   ├── manipulatives/               \# Visual math aids  
│   │   ├── TenFrame.tsx             \# Interactive ten-frame counter  
│   │   ├── NumberLine.tsx           \# Scalable jump line  
│   │   ├── ArrayGrid.tsx            \# Multiplicative grid  
│   │   └── BalanceScale.tsx         \# Algebraic balance visualization  
│   ├── canvas/  
│   │   ├── CanvasGridSelector.tsx   \# Grid overlays (graph, dot, plain)  
│   │   └── StrokeReplayViewer.tsx   \# Step-by-step stroke playback  
│   ├── diagnostics/  
│   │   ├── BugFeedbackBanner.tsx    \# Specific error explanations  
│   │   └── HintAccordion.tsx        \# Tiered 3-level hints  
│   └── workflow/  
│       ├── VerticalAlgorithm.tsx    \# Column math with carry registers  
│       └── MistakeVaultModal.tsx    \# Spaced repetition queue  
└── lib/  
    ├── diagnostics/  
    │   ├── errorPatterns.ts         \# Misconception heuristic matching  
    │   └── hintsEngine.ts           \# Tiered hint generator  
    └── repetition/  
        └── spacedRepetition.ts      \# Leitner schedule management

### **9.1. Core Type Extensions (src/lib/types.ts)**

export type ErrorCategory \=  
  | 'borrow\_reversal'  
  | 'missing\_carry'  
  | 'operation\_swap'  
  | 'off\_by\_one'  
  | 'place\_value\_shift'  
  | 'unknown';

export interface ProblemDiagnostic {  
  expectedAnswer: number;  
  providedAnswer: number;  
  category: ErrorCategory;  
  remedialHintKey: string;  
}

export interface StoredMistake {  
  problemId: string;  
  num1: number;  
  num2: number;  
  operation: Operation;  
  incorrectAnswers: number\[\];  
  repetitionLevel: number;  
  nextReviewTimestamp: number;  
}

## **10\. Prioritized Implementation Roadmap**

| Phase | Milestone | Pedagogical Impact |
| :---- | :---- | :---- |
| **Phase 1** | Vertical Algorithm Layout \+ Carry/Borrow Registers | High: Eliminates place-value confusion on multi-digit problems. |
| **Phase 2** | Graph Paper Background \+ Palm Rejection Polish | High: Improves writing ergonomics and handwriting legibility. |
| **Phase 3** | Diagnostic Error Detection \+ Tiered Hints | Critical: Replaces frustrating trial-and-error with targeted guidance. |
| **Phase 4** | Mistake Vault (Spaced Repetition Queue) | Critical: Converts forgotten errors into long-term learning retention. |
| **Phase 5** | Ten-Frames & Number Lines (Level 1 & 2\) | High: Bridges the gap between concrete objects and abstract symbols. |
| **Phase 6** | Algebraic Balances & Story Problems with TTS | Medium: Extends learning breadth to word problems and pre-algebra. |

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAAAZCAYAAADdYmvFAAACMUlEQVR4Xu2YgVHDMAxFPQMrMAMrsAIrdAVWYANGYAQ2YAM26AIMAHkUFVdIjlRIGu707nRcHdtS9GXVtLWiKIqiKIog15Pd68GO3WRPX8a8q9PHi3PXDr5vHVs7nh7yQf48yN3zZI9tPO8HvNhDOyx+n+zl9PEREsM85uPsbbLXtm5S8E+Mnt18T10F4iHh+3bwT2405Ic8SWFRZMy35powEfV5OU8gBGHTXnnGmI/jLJaPCFKBJKY3EsDftcEnCScmTyAp/B4RNY0nkFQuznqkcrNYPiJY60iKNb4mkh8tEKfHyqkUt54/i7UZcLoYZ+OetQXSLUzax5pt1sITiM9WTmU8feqtzTxGLXGOc9ZY0F510VwCTyAvR7RFxml1KazNPGh3XBR0VUeI+hhBMjJ9HDHxG7VMdXsCATHqOOU7K52H6KJdi4nDpYKgtdGW9Bg2t18PcaYrcCFGAslpkXejHSMYY+kLVkQgHEXEAQLXlYmxXo9h+hLigfDEyu1zC4wEAkSiKOUdRbTMKf1kTiBEQf1eHE5TlpGPCAgzSogFMesTO7JIAQpzAmmy84+MBKJqeaZvTFRGFs9HFFpD9gURlcREjSqPMko4fnnf/n9I4t93n8N4Asl1Vo6pmHzOcs6aHtZ7CbkEI4EkVjmRcrMLFwCbssAyQQKwjGdZ/kqgTBtaAolDW58T+WmHMfkFYdc93yS/FYh2sfmX7JAfoYlZf0Vskv+U3KIoiqIoim3xAXLn2fqVQZ2gAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAZCAYAAAC4j5m6AAACB0lEQVR4Xu2Wi03FMAxFMwMrMAMrsAIrvBVYgQ0YgRHYgA3YgAUYAHrUd5GxmsRp1RYJH8lSleZj3zhOSkmSJEmSZDduJnuc7HWy58nuf/8+BL8u37SdzW2ZtalxKbNuT9fvMIj+VuZBBIu9l/Zie/C1YARzBmjA2giKH+jjsbrxzZjPa1sIBPaZxS6zIBOOIIfXoACxl3LOqROsjS53pS48gvPPakc/2kKZT2cvPDABC4+wVfi/SE94ToWQ8KFqgejaOWX4Q5nLzSj/SXjwiflR5v5UjC50ojYxgIHsFgv5SSNsFZ6xrM2mU25GS90etIS34Hu4zAgrvo7PmqC3Cm/rOj6wAT0/lChRs6UhQk94hOY/SWurRhc66hWDaQN6QesFZI3xuhi9teYCf8IYE66XO9ITXkjHnm4/MKnNUrKftlbQ6uONRdl5345xb4wg4SNB78mID+ilitGk9WyUYCOsLTW64G3WR4UnBn+6ejZCzQcSyd9D8hlronfqkvAIyMQjrBWewGrCsyktEIA1o1Y7xTVqwktgG+/l2hZ6EdLJi8VGfJTx7Fgr/JIgbDr3TehptiM14VVarX/4TH8fyyJkGSIzkbKCCdm9UdYKDziNMV6i+wv3KGzJ8CbwTc9efFa5HI5foiH4UumJsEV4IBjGUz7W+nA0VrfTTqcuuiRJkiRJkuP4BkFwxHafJFbtAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAZCAYAAABOxhwiAAABPklEQVR4Xu2WbQ3CMBCGTwMW0IAFLGABC1jAARKQgAMc4AADCIA9KW/YjnW9ErLsR5/kMnLrx3sfazFrNBqLZ93ZsbPr+7kdvp6Fkw335Te+LBtLgneWBl86e3a27w+aAfb0RhKz3O17AD4mUom5YD8SiJ0tUHVFR+YFgRQjthTYyjsd/XWnYL8q6CPaoy8gKlxtlhNP5qItVy18DPV5sVyWF18jGpQo1rpZmu/XnAQhLMLEKF58rWjwiSJ5BBASzyBFW4vE/yIa/LdAEARzcP5RiPIX0aIqSwUknGRMguC+aE6MSI8LZdq3TQQOCH+yhYQz0ZeXEnlfDt8eteIZmxOevT3Z8GGfw1+GL5JxL1rUiOc08b3MumjIXoK6gMasBH8TxkQLxJfuAqFWZbxE+w92sShQEhKpVKPRaPyBF2S0YXqc2gnpAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAZCAYAAAC4j5m6AAACDElEQVR4Xu2YjVHDMAxGPQMrMAMrsAIrdAVWYANGYAQ2YAM2YAEGgLwLunMUyZHdpC13ene69pTYlj7LP20pSZIkSZIcxt1kz5O9T/Y62ePy8UXQMZyWj6/GfZnj8iDOtz97Us+akPBHmTtAcOyztAfbGx3Dy2Q/ZU7mGkgMFAFxEJsF8aEVk4PxPRwzAlNhNXTCgAjSgwTcC8GSZD0ePmK4RuWTB7o8FF943uEZWgmiW2jHoFMtPNABA/cwKjwxMF69yiQxK+lL4sUghaEJr1RE52U+peLYq1g2vYwKT1WTXD3Rty78V/GFt95fwfL4LnMDOqPqtAhRRoW3IA5i2qu/UTwhW35rQkxq8TG930bZS3jGpghYdVtxSKFEjdx6aAns+UPCk5jcYjCZgK2kEVkb7dnftB9r9aWR20JPm6NoCez5Q8LTuK5Sqh8fjevDrkbe0YZYVKr2Y9E7LmPeiujQEtg6B0PCt66NIlgP5241p7IWHV8LctCra8t68ITHZwnsvb9A7qmW8AgYuhZVnCM8K0KPR3zap6EdY0bNW8UenpByG9Tgs67nK6gwLZYcbr3VMSo8AnO26O2JGEb62xNPeOvHEkWAr/5R5ULSJEjnUhVMxtYStxgVXpatZb2TvweMqeMQq0EjCobP+nsXIhoNra0nwqjw/xn5Ew3dQpV+BHLQJUmSJEmSXI5f6+PIAPtmCokAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAqUlEQVR4XuWRbRGAMAiGyWAFM1jBCmaxgg2MYAQbmMQCBlCebXjMr/O3PnfcjsEYvIh8lEKtVRvVOrU6D0cqtUmtST4PVokPMoYUsETAx0p3tydSybBEfsvwF1QhaXZ3JxiKgRa5qGb0Eoeikm/jFipRkd4feZ0I9HlUIgh7FBefRHoOsCrTzK/NtGXAAHLQD195mPwkOKsjwGu+NB39SneoTIBETvyfswHXrSxpYVJTXAAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAA1klEQVR4Xu2TYRHCMAyFqwELaJgFtGABC3MwCZOAAxzgAAMIgHy3Bd5K0+4vd/3u3m2Xpi9t2qbU+VuOpkseFE6m2TSlJe+wHf5C4mi6ml6m23b4A2bkURjdTY/1/wdMqTqk2JSJjGHkUIAYxaq0TJ8Sc1N2WCUyBYy1h6yQ/LPEitRMFVq2a+vQMqXvjNNbvsVDymmZKn6w2ucikSkGbJWvQj6iHSGRKbF8zG8ECh8B5BMdrg/b1BVx6uGV8pMsyWElTKYgBbwIseoq90BPeX3+Ajsd4Q28IkPko2OA+wAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAAA8UlEQVR4Xu2VYQ0CMQxG6wUNWMACFs4CFnCABCTgAAc4wAACYI/dkqVpy5W7n3vJF5butr5bBogMBoM0h5KjLnZMJdc50XOrodG55FHynscWiPDMbg5jamnuumCAVIsnxQkyh0yDMTXmUiyRarTGlhQnwpyGWvq0tpJ6ii+V6fElsyCS8ppTt2RDrI08NpfaS91Uh2+IrpH+wjY2l7pJXaTzMmrEavxLihfUhFIe1tt5RFLsYzX3TjAksyCSuogvxVyKraSsH0r+ZqhZ9zNkiRQS7W700WsnqXeUz36cRm+8Fk7lJFUmfUKNv95kMBgs4AP0+GAANdRDNwAAAABJRU5ErkJggg==>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAAAeklEQVR4XmNgGAWjgEbADYjD0QWpBTKAuAuIrwPxfyibZHACXQALAFkEwzS1CAZAwTZqERxQ3SJTBohCdAxKSehiIKwM0YYCiLJoJwPE9ej4MxYxEMZmGFEW4QJUDzpcYGRaBDIYZAE6JkYvHJCkmBKQgS4wCkYBxQAANK0zbgZNYO4AAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAAAwUlEQVR4Xu2UYQ3CMBCFp2EW0DALs4AFLGABB0hAwhzgAAcYmAC4b+klt1uWQPPgV7/kZWlz6eu1b+26RkPI0XQyHcqYL2PmpVxMr6SHaYhFCjB6mu5FZ1O/qhCBEfo5fzWaijg67kceBHAjvxdCQCBI3gaKxi8UIc758ulsTnMLtOqp+UT+z+xBDV3lTVWDITvn6CJyIxZiwT2jfKTVsBApiwvSJSbXMCeBlGHm/xOvxG1VIYSOiDPPj/yNazTqeANFzzNQoUp7zgAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAZCAYAAAC4j5m6AAACE0lEQVR4Xu2Y4VHDMAyFMwMrMAMrsAIrsAIrsAEjMAIbsAEbsEAHgHxX3qHqlFhO4+aPvjsdJXVt6flZNUxTURRFURRDuZvjZY6POd7muL98eyisxbpPczwGcctcItCG/B6C51az58u32zDh9xyv07lIJjtdjBgL4v6sBPkcCbqQB3kKRP+czmLzXGPezZhVmECiCyb0C41EriEHGzwjlyPBlDKA1QOByQ/97DPGpZyvnbLHmSOfcRmfsQtH+OMZwTH142SI1vyjYePJzwsvc1qddHJTZqE4tRWK73E541lkSRwckNl9Lzrgpp5cRoApMWHUaqiL2m3uaeERTAPZVRbgJ5sRiRGxJH5W9Ag+l+6Vg6AuNh8i4SNwP+Ns2w6xX2rsrEB8ToEXcwkv/jWiMwdrZ28yFMva2ZCYLWw9GeHVGr/+Xq9ihbewCb5/tZD414gOFEnyR6IWY39vCU/dKdEBV0U9SRuSdYdgfHrxBXBN77p7IgNZWsJj0O669xJeTvdtpwdd3Zo90oB5yLcn1qAG354wA3khrteK8V701IlHXP/HUm+r8e1lq/jM0Su8bh3ZyNZkWXI8a/tLALX7ZyFyt73F9Hy5etHFFvFVYI/wtyASnvrQKDod6fx1heQDEj1znWTHI9EFc6STmP4L3OLKESgfH4DI/rnCn4xV9D8ahOxx6Z6w7pHrF0VRFEVRFGl+ASH8wfa2eaouAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAZCAYAAABOxhwiAAABS0lEQVR4Xu2WCw1CMQxFpwELaMACFrCABSzgAAlIwAEOcIABBMAO5IZRWtj4hrCTNCR7W3v7eXuk1Ol0foJBtlm2VbZFtuHl47dCLOJOso0dC7WMsm2zzdNpEwnsLna8F8Ttbxh6rqDSEi3W6XQAh59AnUZDaayhxYUNiCzbQcvcLA2cIfFb0M17MJp2nwoa+uehxoLDLVVmPxWJnC+zTe2igxUNVDvUQkCqTXCypvr8koznzCMSXyvag3OcDylfCsZDIJ4uWDERVvwzovFB7PAmgVJ4CUmEb3OAxD8jGuj6xi5ayEqjUqKEmLMW2E/Q2k55MKZVcV8lXJW2Y9MCZ4lbXs0hiLMfm9ZRsePxqHh8VAtXdctbpOXltKLFI+L1TakSDroCdR0iuuY6pDOeaIGPahHpLLy200f0HwUhLVV6JcT9ZvxOp/OXHABG41/kTEsNQAAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAAZCAYAAACVdCNsAAAFuUlEQVR4Xu2ZDZHWMBCGqwELaMACFrBwFrCAAyQgAQc4wMEZQADcM3fvsLPspmnSn5Qvz0yGjzZtNu/+JOkty2QymUwmk8lkMplMBuX9S3vnL96AD/7CxYxmTy13tXvyH0EQ/ljuWYg+vrRv/uJFPC3j2LKVkXScPCAUn5/L644oQslFI1jPhAL5+e1fwNZPb9csX17aV3ftbLARHTOu1BEYE42+L696Rf4eQUfANuxAq8xWsJoSF1eCvpkNxC0xi/bMC7tHAduwK9oRW32x/9CNipztYVB2STISoX+9/T4LxvztGjZEDn9erklwkY0/go4EFOMrWSiYmQ3ZPM5CtmIb2hGfkc+5rgWUxu+zd3TYSu4wNrFZyiP6oit96Hu2rRmyx/tcdYHr2I4PmOchxQgHYkS04hAMCChkcCT2UShpsYPGahLZClRsa+9Wep7FUSRwxNU6ysc20HQtsrlXx16wCZ/Lz9jtbdU1GwvRPGtpnS9+V8t8SkITAzaBuUZ/nrsSir0WeKub4tnqqzkeUkAJuug4IUdboTAaodcqIvezYiGilTgCO2qDpFRUa6gdJ0Jbbs8IOsoGktvCfH0AQq+OvZAAjK+5RfYrkT2tidLje5CNUSGSzuSaUP/ecXthfOLWx4EWS+LawrVI924oQpF4cjTBQEBi5FriCG1FsyQhKWuDZUshAoLYOnwLW8axMF/vSDGCjrwnKpRZIYIeHXvxBZh5+gKjYuVpTe6WZyylQoT93o8jFCJs5bgbHc2wFduw3XJYIeKl/uwNOvNiCAGMsTjfG5aRJVFt8gjE0dmf92WFU9Bny/strUGhoIoKzCg6RrDDoEV29+i4JxQk9PLfJrIkbk2U6F1bKBWiCIr8lv57QzxptxMVoggd43q1+ofSmVoOtasoBSvrH+GTqCV5GItA1ArJO/l/9h4VrBZan2NeWfCPoqNHiZAVxFod1a+2bUk8PYO/vVZZQtyhECmGfXGNOEpf+mrs2kJE4cr+wNGFxIsMkEPtPR1B/LmxhJKIybYkj9+mg4SLBOHeWlDxHPPyjcDw12h+fI/siRhFRwvzJ6Ce/A1DjY5ngZ2+aLYWor19L+hbW4jwX00ROgpstKegmkKE9ocUIZB4kQHPS+xQrvmPnmuw+u45CQkXOb0mgSgAfiWh2b/O2RaNYykVotF01GpskzqiRsczYd5oprnzO/ojy1oh2tv3orYQ4cMri5C+/VjWCpEWrp64K1IqRBgbOXRrAhHwrAD+eFELTvPj9RaijNbnSoVoFB2BZ9GTd4ls1a/VMdthZG3NbmxknnbFBukon5d0rbHb0/KMpaYQobsvQtYXEXvry3jM1bbn5W9h9zrwPu7b967ZvBkdEZiAR98QrAFbjxQYbI8RLUkUJawS3wcrSNwWWp/TN5+IUXSE6BlsiApRrY7MD3/UtshnFvnW66lk0fN8c/N9gGvc20rNXEusFSLs9kdqfOGvefbWN0Ka+zpAXKCL371FO9FuSHIm62Fwf08J5w2O8MkjtiZR1JegzMSgfxYMa7QGI/b5YiNG0ZF3oJsKjFqUzNCjYw9KaKuX/qiC/UqK6A8t0jUqrGu0+l6UChE+io5+zCfqfzZRIdLuWbsktWjXtAusiFGgA0mAWKwwGIuYXFuDQCitStp+16CEkw0Sw1dpYVfNrfQIXNLmah2VJFHL5tyjYy9opCSlKSF80UVDaWl/t5DpsIaS2Df7Pn77+2o1i9FRZLaX7tEOKZ5yYAbBTh9WqJaVZi9ICgQoOY4+pbms0RqMQEGgqGeMomMNvTruARqh15rP6Yem9O3Rtcf3k51g9blq9dsTikFPtW5dTUFHhWyndid6dbwjPb6f7ARF6O4rgr7uX1kIdPS6MyPoOHlgWAWjj9Z3YOuH26PQB76r7WhlFB0nDw4res85+yrYVo+SPLUfkEdkJB0nk8lkMplMJpMH4A/yQG67dZe9IgAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAZCAYAAAC4j5m6AAACCUlEQVR4Xu2Y21EDMQxFXQMtUAMt0AIt0AIt0AElUAId0AEdpIEUAD6z3IwwXq+Uh/dHZ0Yfyca2dPXwTkpJkiRJkmQKd9U+qj20DyrP1d5/7aUsv90DzuV8/Hyrdv/38TQ4H00eO9bTb8hrte+yLLYgNs/4nsOO1b7KfPEJ6FAWXxCcBODLHqDTmpEUNwSlhVZ4hCZYW1l8x+9ISJQ2qV5IskQXn+W/vzNAKwoPX6zRgRRCqCAJgoVtIOqCNotKUgTtxVlRtNYWwFNZqn42a+cSV6gICIrNeqOG7LIhVW45R3iSx5pzxgPVrnX4FArwypD8tqpJhO3GTQhC1dwTvofGUrRycZYzopcP63QeXam2JhnRvW6BRk8IglH2vMKTKKpvVtD4ow6jM4V3pnIXEafXQpVb+hNhiEaM/bwlPAd4RKcd2cdro/2s8BZ857vevJ2FfNtK/gnNbsuW8KzxiA7s1VbSyNrL20ISe6NNQY/W3hq6KXRnUblt8IeyBMK8aoPUO7QVnT1mcYnwuoy95iksgeitX2HWKp6KY/O2ncIXygXoXrF4R43eOLxmx++ItU4M0xMesRFYXSDrdcUWdAj7cylGUXXbavRerrdCPkV1OCHBWxs9w3gW4ZL3eNArJOdK9MhYuDYSfmvU7Q4i4aS3lXvoPxq6Z69Kt+DHXn/UJUmSJEmS7MQPXU3IhahdC0IAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAaCAYAAADcx/BtAAAB4UlEQVR4Xu2YgU3EMAxFMwMrMMOtwAqscCuwwm3ACIzABmzABrfADQB56lkXDLSJE2oj5UmWqlaX2j/OT64pTdx4yPGobzpxn+NJ33SEfE45npNRI8R9yXFOy0CeUAyFvOd4U888QRtyu7teH78+roeivEUWyCOSyJd062AawKzTFHkbuhnBD/pBLVPkdbAIcjJbBUyR63C3CzbR3jEgkshsduVJh40ZyzAxRf4ZBP5INx9+TUs3NyHHJmanaymkMSLze45J5MM1+XlCJ3PExYuJro1vBCNEjgq1Ee54iky3YTG1sVueeM1vsYXMbBn4F8Xq+wTLbg39/pZc/hKdy2554ZO6Mwg8HT/V9wnTf/7Jdzztgs1Ir5612H3zOqblaIJAW8t6jZEiy6mnFqyKd9eGdWWhUzO8EHEAP20+AxaMFFlsJhLUZvJiCpHZoYsZRERvZZTIdCU5RRIZeyEnk8ilP7FEvUWWD/aME0lkrIv6TCKXUFiPXSCQdYIE8eFIIjPpUluXyHQzAvdsfL1QjExSFJHRRVZnl8gMJB3EjHl9L2Djld0fgc/Xa0/KEwn5ITLXTRrRuRi6nB8ZoHfJjyBKJ5eYO1l2zN3+LlbAuR3rki9xEUBg0YpV39TJk8n/5BNSPaYiHykjqQAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAZCAYAAAAsaTBIAAACWklEQVR4Xu2WDVHEQAyFVwMW0IAFLGDhLGABB0hAAg5wgAMMIAD6Te9BJmTbTe+PgXwzmd71drdv87K5tlYURVEUxV/kdoqH/fXa/TbM1RTPU9z4H9q88GObf79v89hzcjfFU5t1RCE9aGOsvrMX7kV7OjVoeGnfxnD9mGJnB42iySxkYTFMUSLY7Fs7r0HS1gsln2T439B+Tq2CYiJP9rRIX0oPm9NmvDnv7ediPJiTlAVxWyDBPA+TbLzur4L1uceVOZuq9EjwfFs4IHNSJ5lJbN6bw+fIaRLCw7NsNSeahzZ/n+++uC4FObMm8JlC95oXIdH06ait8QDucTztfaqTOVlSwgy+0tCFBl80v8kcD3pTLZZN6wRE5oBOFMFnxttWkmGrOR7aatSy1AG4KryxlwCt6b0zQU72zAFrEEdzy6mBtMAA9HGSI1jfFg4vL+hdM4hx1tC1yLZ05qReo9XO7PfInF2bj6R6vEzifg+EMN6H1vGxljwLGiiWiGgdtGaTeWzY9zBsgk1aInP47N/WVI1ED9by1UboD9HHaPIwHY1oGEXFdEl8rheh6n2CaBVsQq+i0HtlxjRv5AgpkQGY0nsuXSAybsSc3klfigzRiU4RnRwqOjIHGJvqo+1wcygWr1FIf2TOWlvR2+po+GcsQdeJ9KaIzEG0b2ugP9AsW+ZYmO81Cu759kiHYPzWF5hjoILKGPqFTPEhODkYxJWxPIwkecNGOJY5vTahdo1O6ebeJVErPlmB0L7YJJvuJWaEQ82RjiUYQ0IYl227/5q1xBZFURRFURSf4Qnaf1Gzt40AAAAASUVORK5CYII=>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABCCAYAAADqrIpKAAACBElEQVR4Xu3d4UkDMRgG4MzgCp3BFVzBFVzBFdygIzhCN+gGbuACHUDv5Qx8DaUg4qWU54EPLpfr/5d8SdMaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADDffhjvlnpb6vjzDADARJ9LfQ3vnsvzy1IfZQwAwMayknYtsD0tdSpjAAA28tDWlmcC2RjYMk5l/tDWbwEA2Fj2rSWsXQpsWWHroS0rcAAAbCwhrR80uBTYsq8toS3fZO79fBoAgP+WVmevHCjo7c/Hth4yqNIOtYcNAGCicYXttTx3CXMAAEzQw1qvjCMrammDZv9aVuCy8gYAwA1JGzR72Bw4AAAAAAAAAAAAAAAAAAAAAAAAAO7FbqlDW/9rrV8An8r7yPVU9TnfAQCwofGGg179Wqr6zk0HAAAT7Nt5CMvNBqnODQcAAJONK2Zpj1YCGwDADcketVz0XiXApY7N/jUAgD/L4YB6cOBSjStqVfaojWp7NKHtVMYAAPxS2pcJVddqbHlW1+Yiv8/hAwAAJkg7dNyvlhW5GuIENgCAiRLWxsA2nhhNWMupUgAAJkhY6/+9VmVfWw9z44EEAAAAAAAAAAAAAADgRowXtN9qAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANyVb+jHgNYQLeNXAAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAV0lEQVR4XmNgGAWjYPiCmegC1AArgVgZXZBSYArEO9EFqQFAQZCBLogMQLaeIAM/A+LPDFQMY1AQgAymWtgKAfF1KE01UMlAIDzJASBXUh1QLRxHwXADALG4FJ5+XBoHAAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAABw0lEQVR4Xu2XgVHDMAxFPUNXYAZW6AqswAqswAaM0BG6ARuwAQswAPhd83OqsGzDtQ3H6d3p2iSKIn1LTltKkiRJMs19taflE3bVHpZznsdqh8W4ju9W3JV2jmJf7aXasUzmyg2fzj7KSQwLxT+Xkz+C4PNWJh5wQXg2OVAceb6eX14hP3zwxxDivQxyxZGiCIqhImpbCEwge55zJINAt0JF0b09IajHF02e1BZC8CigYBV4MCpb1EFbEAmhDvdCqJNCZoRgBfChCyx/UQgE4BodTG2CMfbjfgbOONE6BOY76o0Ytee16T2bEdAiacMc1oQQdv5RlOPR7BOcWdTb5tb0hAArRmvz/waF+81Re0JUJCMyK4J27hnzc92jJwT50dnExEeC+NEeIiFa7UTxsyIgMInM2nDVDJEQFO/fGrxpOIeFoJx3iISgeMbGivBjlS9EJET0mkQg7uGziWbIIiHsCml1ffsi5BZEQrB3tYQA7vHbwArBfJuz6rZAiucYs62s4y2IhGDx/GgA49HyX+EGHFCRTlCBNpA6pGV+fK6J2rtlFmpBDNWknwZenCYoqf8S/wFGgP2LmnzHJ0mSJMkv+QJhhqP7aFBk2gAAAABJRU5ErkJggg==>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAZCAYAAABNcRIKAAABwElEQVR4Xu2XAW3DMBBFjWEUhmEURmEUSqEUxmAQCmEMxmAMRmAAVj9FX7pcFtud2rO03pNOlZI4/v53Z6elJEmSJMlkHmoca7zXeKvxvL4dgtdwWN+egtf0uL69hQEfZRGPicRnWV4ShdfwWuOnxsk+FMxTja+yaMFE/PhePfELPITrFgazGBYZAaaRfTsf19Awo0LRISMFyUZPs2t5yJsJDCQ7EUio7QZEc4170agzbFu/lIFuxUgG8qvKYCCtHgXVh2k2eTPNpCrV0mhqVqMF9xmIcF6C+35hM0AHmmyrRUBBKYkUGPPzizdDnlhDCb9/RaM9i+7o6VDyR4O1tVBHEHSowFA8aurhpk5vQqb2FkICdPr3YiijBg6f3vy3wpppwVi/r28gW7aVMIlrvYGM8Vnfi141WJhzlpGgLxl0W2Ty7lpan0AyIpJD2RrJtRaXdIiix5/MpP32zKTyIj+aaSM/H/r8NQ/j0DoarW4TGOY/0IfanErwJ6YOgJEsXgNMQ7zfHtDgtUWgKrR7/dABpL9NiFf2MLjXXteEubXp+4hKqAfzlEwZOXyQIpqBmNh0/47Qf/L0JEmSJEn+PWenpKHeMwTLRAAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAZCAYAAABNcRIKAAABWElEQVR4Xu2XbZHCMBBAV8NZQAMWzsJZwAIWcHASTgIOzgEOMIAA6Jt0pyXQdHM3zebHvpkd2tK0m5fPigRBEASBI/shjuMvfAzxNV7zgPef8ovOkNNZJkeLfA5xz+ImSWgrdpIE/kh6Nzn0BLmRE66KcAMV+B3jW1LlWqIyyYUcepJJb9ROZpJJBXqhN5nawULmP2G0MN1VDfOLpPmKinDsuQD0IpPhzaIDVTKvMs2TrFycI9eDWpnsOnS+t4QKWoN7cQFmmRTIFxwtXNoKUIaHW6L0nJxamVugw3t+bpL5Di1cGu78l7f6Ulh7A3jLpOHJYY5ZJnMkW6M5FplbUSuzZoRolDjIa2e4SsoJV7noJ7hpSWbLjbtSK1NXW2v85cvO3DNJPp/TaAlawYNamS0wy2QBogJsTCnEMSJ1JWsFyb6L1QpsiErMYxUdLp7JB0EQBEEQOPEAXuaJvEfO2KoAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAA50lEQVR4Xu2SUQ0CQQxEqwELaDgLWMACFrBwDpCABBzgAAcYQAD0sVfYbWa5D74I95Iml7Y3286u2cJPs/I4eQy5MLHxOFjp2aVal9HjbuXnDGIXj63HevreNx0CpkNQifLzzcomQJ2+86ujAw1Mk0URQvCYcmzVs+kJDayl1sc7ckyLGDXW/winYTwo0ZgeUaalBz/Jd2Ht8EqJUieHUEA/OfobmDAbrUSZLucgDmt8xSsKdVztPVUcqA4CKapQAvHU8pvkYF7FLEoUmCouE7qe1oRYjoBpsaa+/frdfkW85VkfF/6NB8utTLiMljftAAAAAElFTkSuQmCC>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAAB8klEQVR4Xu2X4U0EIRBGqcEWrMEWbMEWrgVbuA4swRLswA7swAYsQHnil8zODrsL3F38wUsmmwADMx8D3KU0mUwmkybusj1ne8t2zva47P6FvlMqfd4ezLhrc59KjO9/3yhWcnlKJS8gPto246STSXEEHL5TWcRCW80Q6RbYWBGAdVmfDbIwJopRwoS8pjJQQoCcUR8I4CMVcay9ZPtKOwsEEGgPn2m9QbTZWIH5iZevKnkXCUElCAmhUkIk2y9YKCrNPXqF8HEBwtBmBeqNazExyjIxSts2v+sI43fnKL1CUIG+xC8qhGABFqLcty4WHZVeeoWI0D1hE2d+ROMr28pngRyphOgYWBh36NxVuJQQJIcIHG8L89sKIZ+9zV3BYJz85ALlWdwflQiOlH9qMarJt2EtgbI+80RxRvPo5WhC5RZVBgsj1BH03nvD37dhLYEyNhKhhi7aKnoKfRtOUQkriRFG/RHAiqDKA164aBM3hVCZ+8tGTyr3hkUvymgiI/7EdHJtJK02bWIkRPWC55yxw74kuTBx9GdNwo0kAr3+JBsdK9q0kXx9PvgRt/3RuIJOEkdp1GQSJo6cJIRfqJVeIVS9kVlInDXsr19fRSFUBonjaP+sRDCh/TnbQ68QLRCjjsxovFfj0O5MJpPJ5B/xA7kZr8HNaSuGAAAAAElFTkSuQmCC>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAA6klEQVR4Xu2TYQ3CMBSEqwELaMACFrCABSzgAAlIwAEOcICBCYB+tJe8vb6thH8kveQCK7fbvdsjpYG/wi7zVD/BJvNQzzyOmddKfkcbYp/5cpxSMbbA6JyKHnM0j7RgjAjBvfKSuZ0pisnTnXNGAB7WAFPM1kBCDG7uXJM1+MaUvtGQzmLVlG4Ygxv5TrIeeBCGYSBMbV8Uz3XYlQFV8C60NV2owygxJl0zxkVksWSKEVNYQ9/zB9pLC5naXaUe+vN7SagGCP0opLFijLiG2me91PBFcYOWnoQS20RKHtFXNAOj6m84MPAD3oZNS9TbmUU/AAAAAElFTkSuQmCC>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAv0lEQVR4Xu2TUQ0CMRBEVwMW0IAFLGDhLGABB0hAAg5wgAMMnADYR7nLttzsz30Qkr5kkst2Ot1eW7PO37J1HdtiYO86u66W+97GkxXj03Wrh2cG12jFv3FdXPfP9xeYWHVnOpSJBBIceVhpKEWFEsYYDUTwEpyiQtmqCqWeokLV5KneLlbxk9D2pFeFcsJLk9UOKlTowXQodzVFhUJ7J/kV+IdQm2F1BpcU4XHwAAimczrkqq2G7uhseoGdTuAFhMtEXIyvY3cAAAAASUVORK5CYII=>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAABJklEQVR4Xu2UYQ0CMQxGpwELaMACFrCABSzgAAlIwAEOcICBEwB725r0mm63AxL+7CXNQdfr12u3hTAY/IFdtFN5wibaofhqsLa1zgL+c7R7ee7ny3NYfBmbQi5AQ6JLtGfIMV5SPgBR3mX9FnLsUQdpCEKMlzAEvK9CnKSs18QpjDjrI97LmZIg2gvJa+LSORkhSLwtKvFLcbpCq9k3wqL4I9o15CL47QYWWuIeMnc3HidzkZlQNf8pxmONOO0ntpYridnNIAJ6dkKvOHmlo6tozalXnHYvClMdR03zrTiiWpjOuvEkqonbiwaWxNnx9lLhRrS+BDvczpYNR0c8WuII6AtLDJ8XnzaG3GwkluOmzyrgR9SaHo1d09aEFpPIrXAwGHzKGz4UbKCwzpYsAAAAAElFTkSuQmCC>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAvElEQVR4Xu2S0Q3CMAwFPQMrMAMrMAsrsAKbMAIbdINu0AUYAHyipk5am0iID6Sc9D4au5cmtUjnb9lrzvWi46S5zqFvV5YXjpqL5qZ5aIay/AYRffQjv2tGCcQ0setBYimSSV4n8Wv0s1lKJOULqXEaD2skJZJyCtb5Os9X0i2y6ypoaprhKvhZyFNapEiaZMYnKSKmwAvre16RSRknavVcMqspkRQRLxPqFntewfDbaNQxbE63Qq3T+RVPQ9hB0TuZAwQAAAAASUVORK5CYII=>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAl0lEQVR4Xu2RQQ2AMAwAqwELaMACFtCCBRwgASc4wAEGEAA9aANdlgBfwiUNY7ttbSfyQSqN1r5QaDQ2F6g11iQWOeQAIgujRa9RBsNARLjllThpDHJsYNwFw0Cc5cyLqvlnY4CFNHlOpHpv2c5jMYeLIVeSp49XsqK/xBUXw+vQkjQXquamAMX403GS95L5LFyDSF9/ZANlIikJ9AEUNAAAAABJRU5ErkJggg==>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAZCAYAAAC4j5m6AAAB7klEQVR4Xu2XjU0DMQxGMwMrMAMrsAIrdAVWYANGYAQ2YAM26AIdAPLUWjJu/nzpEVXyk6xyueTi+/I5OVIKgiAIgmA3HnK85vjM8Zbj+e/tJbznONjGBTymszYltG7ufJ9yfOV4uVzzoJ90XoBVsPArc2B+5kZQ8kAfC6LTjtjSn74fulMLOjJAhAeuCVbbgyQwAy90TOuFx4CYsiY8urEw5Kvb6D/kfOmsy0mEZ2IPtxCekhX3zD7rFtSEp83qJpVa6l9EC4zLGYzrvMwKz3iEX73VaGpC4mratXZu4QXKhvI5Jb/bYUZ42TP5vQfhS2w6H3EaE+D02ineY0Z4cTp4hCdX8h4NjOVhVHg5m74vf7vB6Ti+dzojjg1EYJxtJ1rJcB/h9fWo8HszKjzvvVl0QT6jas7nHLBOIpiYVbfthP5q0pCoTfjehEcn+w5deDn7gvJV0ZvQgmD2WT3k/wi7gHLAc906bzCBra5eeOjpcEjXotPWRJxF6ITkE1OX/whbhC8heY08i0oS84xErYprtIRnbrslYxLbdgWrxH5uD5xjOk/YclqJFcLvTU14OQtttaLdUN6sGp1xNwPkc7K2J7eYFV5XoA7v9jBLLQ9CQGR7z50vzpeS5dd1SChmhQ82IgddEARBEATB//ELeWTAIDmAaBYAAAAASUVORK5CYII=>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAAAbUlEQVR4XmNgGAWjgEhQiS5AALgBcTi6IDHgBLoAFpABxF1AfB2I/0PZJANiLYJhmloEA6BgG4EW7WSAGIqOP2MRA2FshhFlES5AdR/hAqMWDR6LVjJgpix8qQ65DAQZDLIAHZPiyFEwCoYyAADzDDl5n+F1awAAAABJRU5ErkJggg==>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAZCAYAAABOxhwiAAABHklEQVR4Xu2VCw3CQAyGqwELaMACFrAwC1jAARKQgAMc4AADCIB9uV12aXaP7hiD5L6kgTTX3d/HOpFGo/HTHHq79LaP2GY8uihncfd5+I8vyqm3V8J249FF0fdiaItyFZcZh0K7D78WqJI1xoPQ22B+ApJwUEPQlD9HrXATehSYaao9Z7a/KlxDmzrtLKRWOLF0msKho7h4XPzQTgO1wsO55t0r7jzZJldQgF6b2FHiqzUnQI8sMSTDM5NspfCguLN+A4RGheiY9mN8Lyx44dklgWDdLitzR4Uu629GsXBavJZwxMWEZ0fXB68hnBg9ohTyKW4sk0xlbWWucEAoRrwXXaSFzDrtNFIjHBBKPC9ybgt9FJKvGbVGo/HPvAE+Ql0dQ4ksqwAAAABJRU5ErkJggg==>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAABRElEQVR4Xu2XDW3DMBCFD8MoFEMpjMIolEIplMEgDEIZjMEYjEABtP6auHKju8T5OauV7pNOqpLL8/NL4rgiQRAEwSJ2qY7DgwWfqb5TnWW8rwWbe+WCk3QXXFP9Pp9+cEh1ka7/I9VPqr/+dytcvdJMYnuxxRFAmAFK/qUz1opmXi1xRDmHkRJ6GWAKjI/BYz56txS8vN6xxHm0LHGOT8H1wzuUISR0tgpirdc7lrglko8PB9XQwlgaAnh69RWX5zDWhACuXl3FewiDRWtNCODqdUp8aHyWeA9PAqt61bd9BFevljh3UBOx0rcoXwdtzZiDq1dL/EtscTYqNWhrwpowPL2a4sA3uNyQMCH6ayaihZBZGsbmXkmOJq1K8rvNAKROukyiBvq0EDL8J2BTNUULr1UwGVLN29xX5p28BkEQBG/DDZe/pjwsxI8uAAAAAElFTkSuQmCC>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAaCAYAAABByvnlAAACV0lEQVR4Xu2Y7U3DMBRFPQMrMAMrsAIrsAIrsAEjMAIbsAEbsAADQI+iK6yr59p1mjQ/3pGspnHsPPu+D7elJEmSJMm23J3aq99Mhngsy97xeW9907yd2q/fPACfZbGr1b7L7RwJJ8Y+icEnNj3XD83wUP4XyPXRwOuw7cM7TryXpe8WovBuHKKOCjkQYk3DJF9lmQilj8ZTWWx78Y6y2Esfa9gbHMSdWIJMOzaLJV0p3I4oiNJptEiJFUXP1hAFtU1c/5QVzsGERIYK+iWhT5jisTzPpngfwqoxP588N1P0sJGFOrKfvkisvcEWHGM6XbGZKkBs7qggjCF3ssFsNB4sYYE56Gc+7pNrGSNPv6ToMadHAPd4N3PjjTMiXxvWNB0ZwCLqCZSLe4LoOU9tzBXN56lEovj4FnVKwjY1viOIR2cLHE42jjS3uwdjVjkGL6w3ZbQ4Mo7nHKU8pY6WwOdOTBESMEpJVztmXgGcYxptVtR6gug5x2tQSxDgflQTIlr1A0adaA9W2cAio/BicT2l2ZxzgpAaoCcINaZHVD9qlM5GNsMPGiPtEqIIHkI5OKLl/TWtlKXUIqFbguhHKIW+B6moFtlBCPpH6gjP1DWo11rvjNAp8mIY1Ap/GBFEZ+3aYAzC4xFFSBD3br4zPopQR7/C3fsYK8c4Qv2QncMi1n+N0NiQ+qysCet2zoOZT2duRODaI0GC6MRCP9cI5xvsRPa4/cw55ZUbgBDYNRKpm6K8HOEpi+89IZINcUGSG0IkKIxJP60oSnaCuuK/fJMkSZIkWckfrZfoAp15DysAAAAASUVORK5CYII=>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAZCAYAAAAsaTBIAAACN0lEQVR4Xu2YDU3EQBBGqwELaMACFrBwFrCAAyQgAQc4wMEZQAD0pf2SYbLbzm5peyHzkgm3vWl3/rfHMCRJkiTJ8dyN8jTK8yiP8zq5AR5G+RzlMkyJeR/la75+BthAoUR4HSa7z4IipqCJ2csw2V4CG99mQT9c/NdRPty172FK2FFgPM6xJ3vzeQ0CEdXdA4qXuKmQCHrJHhKixOEnhY+foQShjFjYxF+L4JMcBaMlJQc9OEZRRXT3gqCzv+1y1sj9vMYf7NRa19Dh/lW4sXRzj9O9yRHRbmCcoRPR3Qslh44RSo6OBNnI2LNIrwmSRMf0OnxEctAhORHdvbHnMrHDHjpFaPT5c7ErOZqPveydHMYZe/B3TfdIsCf6IsX32N0cK5v1Hpo3dKwFXB0Da7oWig7bohJ5psAm7iF2dsTViCbxF7Sln4010CU4XngL8deQqCFLAec7AmHXNd0zwEeCvnTQX4aOxADORh1Fz1cbwsb+GhJNei3gjA3/+lnTPRP8xKZSByl5zYkBHLdvbT2QiC3UAq6D1Yp+E13n9ZLTfOe7eUmWniWw0dvJunSe8DzstM+9mM+rkJiIUUt4o1qpJadEiy6VrGBGZO0/FNob4bPQ67Udv8SVuPgfnU0/8sksD96SoFtNzl9DoBlRflz7GGocI77rm2Klt4gto61pQ4PGgZfS82zVWrEVfAR0F8mgS7Bf8bNdV/MLObyoSsH8z+i/+RqFfnTdFE2HXJIkSZIkSbLAD+px2D1H5WaaAAAAAElFTkSuQmCC>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAZCAYAAAAsaTBIAAACV0lEQVR4Xu2XAVHEMBBFowELaMACFrCABSzgAAlIwAEOcHAGEAB9pH9mWZI2OXrJMOyb2Tma9i6b/zfbkFIQBEEQBFtcLXG3xMMSt+v1v4HFvixx48YRA1EkBvcZ889dEuZ6W+I+ZWPI830dn8H1Eo9LvK6f5FSC8aeU80WzswuKST7Sz4lIgHEbTHb2RGdwSjkPC3lg2GgoCHKhYFUo5ELhWLjmHs8QmMM6unVjQglfMgcR+GQyn8QI2CWEhVz92AgQmEL2Y+TDjhLk5o14TnkndYHwfKlmjh8bDYu2C6dAyNWLNAIVsW2p6jrKB7249uZwnwJvhi+wRbfamh+bCSZRlTOMAb1DrPDeHO5xzY6y2tGB0LoJ3JeTW+aQEJ+KWS9ioDXMMqaG3jtWO3UiQoZ25Y3QqoAtc+yP8mKbeVKiGlshV1tUe9HVclb0vqZoPNYgNGveNWpn9rpkTskEnttbCL/TGr4316Cl7c07EvKmVZWMuU/5HuvDeJnE+CY6Dlpq5pTQRDUQ0VflVrRWFLl1tYYLQ6GUjCFPf1pTx9k9YeKeF+iUsuA6NgOiMcYPW/bMuRQs1p7a9uBZv0v3ohVMscZoLt2jpXm437oBvlHaORormTPjH0AEKLXZGjqFtoZfZw2Ep8AtfFdj7KiSOYB2PQX2Rckc/vY9ngR4rrUVHckp5bl7DDoa1k9r8p2HMWmHNr6tgQ4ozcgUH0ItkOeoBib1VTMKCoX5uyvvQLxOJc1AWvGJdrQ6dPSG/RrE0LadKcxfA63QDHNm7vYgCIIgCILgED4BZa3Y7PnTOuQAAAAASUVORK5CYII=>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAZCAYAAABEmrJwAAACH0lEQVR4Xu2YAVHsQAyGqwELaMACFrCABSzgAAlIwAEOcHAGEAD9aH8ml9nNpgd3HZh8M5k3tOlu8ieb9t40FUVRFH+J69nuV7t19wrD1WwPs73M9jQtwkUg6Otsd6u9rcY6EayvYni7MX57QOzE14qDmJ9XQ6dRnt+w2GG2x2kRlYffjzyOwedjWvwF4nCNwkTg0zMS2xPyIQ5/ChGUe1xHZLTJNNKXg4QVdGRrE0ExvBgSNxKI5wiKvaxREAIeBntGlJPPGzHRx55kruGH6CGqln2YY073RhCMFYONfGCe3roUM3ruEhADRfY5SB/fNCpECFXRCECwU5JENNbg3wgK6LsTse2p2QP2J/bWWEAThKdbLUNxSRQHVU1HFMFbQ70H/qcURWNiT4hBXdkSt4VGCLp10ZzEbNdtmYGsMZw9HVod0YMOxz9r/hj3wFd5ZsVlbfQJG9CKa0ForrXmowdxMn4e7Z0p4LnQOLB/j8Ql36GwoE8qqmdR4pnq6xNlK3R79Ll3bjRLLSNxeSYlrPipuK2XVAaC9PtGsA9xbbEIOtCPksO05M17wMem3wJWWNYI0fywbBkLbDb6NefpnZgIvc2zlond0+tc4rWzWQxfxupSW5HsC00i+eKM0J5bxL0ELXHRABHVzbJWdzfR5xeLS9jMXNGvu2EFHRI3M3YugUT1Ft3DuJdC/6fAHBl17G/APlvHSVEURVEUxT/hE/aXx6rtBB46AAAAAElFTkSuQmCC>

[image36]: <data:image/png;base64,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>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAAAaCAYAAABYbdUGAAACvUlEQVR4Xu2YDXEcMQxGjaEUgqEUSiEUjkIplEEhFEIYhEEYhEAApPu6900dxz+K5dxee3ozmsl4N7uy9EnWbUpBEARBEARBiy+b/SgXgyFfN/u22f3573ydmN4MPzd7LRcvDO/v2VPaE3UNnDZ7Phuxo/geNvuVdvG8/L31YnxP72OWG77i33Jhs2G9JK+iIyAx+EEwctg0AuIaFX8U+PGYdoHgawlCwkfuOQqEUhMwceMacVwqIjbrTQ6Bm/3fHHXCmpCVnKOOWomY5NT8A+7BR/bxUVaI7i7t76cb1iBHS2PIkaAWfA0CUoJqSFxld7oUJMUSI+6ZOWpXCKjVwXO4Tidyo4rSAO1R5goBqXpr1aO5Ynn7NaLKtSSZ+2awPHsEM06rgwuuz/r4BpKuc1wD2JEComrL6qEl4yPioQMdIR4gudbOgs8zrBBQa/7JWSIgNpk77D0bVwhIR5SOVBldh67Uq6ocqpC9WW20Z3VG7DMF7BXQaP4B5ZmYuuAlecKtLZoAcm9pJI3OUa5/RFS9+Qe/esPrZ7Is6Gf07ag0nl+uYdaOdkrvO3hJXqTTKCA1GwmIFl5WMPac9gCU65glAL35B7wzmgfFaxQbaPmfwz1ljDAKpFzDrHu2zD/kifdYctKERNce4Kky7xFWm39yVDmWYLYqvGW9gIO+k40ERExJ4iyj54+QOFoQ216MTWiuqKEuNINXQL3qoTsRGGvlEKB8hhqZZTAmOfjXmoH0gdHiXwuPgEbzj37FegT+J8E9hR4poFb18EzNRjVxXQr8IDa1BEg8Xv88AjqlenfRJxri12ocQ9SCZTwsryRVf261QPWYFZAqu2VcxxdPZa+CTkXs8IkjlT3jG1XvFQ/MCEjCadk1xa/LrID+Rdgn+yV5KxMzI6D/BoK6Mpi3CIIMgiAIgiAIgiAIbprf6uEaeJ+bQuUAAAAASUVORK5CYII=>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAAAZCAYAAACis3k0AAABqUlEQVR4Xu2XAVHEMBBFowELaMACFrCABSzgAAlIwAEOcHAGEAB5tH9mWdJNew0w19k3s0O7TTfJuyR3lJIkSZIkB+GhxrVPVm7K9Iy/cFXjbs4lM481nmqcanzUuP3++AtyPLPxXiaZFwkrgRgJIhGCzEgk4l7noG1r5V4MbK2X8jsTQWgkEoGHQxN7LuOEjhbJuHiP0NnKtT1rwZ+/Nq/3qaVz+X6+F63cZugEmazSloAt9ES+lakvhHJN+wgmRztqaozk1A8CyCGRPEcHO03Yc5traugd2jKmVs1d8Gloki0Ra+iJZFL61Fkd3NNnD2rS1p7tEmz70hlt4Tk5hAnq6MvO19y6axbZIzQSyYD91lF7vyU9WlEWrWqL6lkk0q+0pZrDRIKV6ScfEYlsofa9Ld5q05p0JNKPaW3Ns9izGiESyephK1kOJ3KvQBGJJL8k0m87z9pJ/5tIivPiqJ9AkUj68Wfhqfw851qsnfSfixwtkFoMzIcdKF82tOOAJ881EqP/siTGhsT0curD5rjfUjOEBhQbIfAc2Mb03x1okiRJkiTJPj4BkenEZUlXrX0AAAAASUVORK5CYII=>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAABPUlEQVR4Xu2VAQ0CMQxFpwELaMACFrCABSzgAAlIwAEOcIABBMBedj/0emM7CCFZ2EuauzVru7+tdyF0Op2/YhVtNzxhEW0z+JpiHe3u7BaSmKZACAs/D3aIthzNaASEIKB5PhFCHxEnA/WaxsDJep/8ilVv8m57FXz/FiHBJdoxJEG870czppCYufQTz1NIBbchXVOuJzl40mvkxATzGBNPXeLxEYOPmFzOIgi5hmdfsNuMKVBDYuyOURCf3QwWhs+fDD5qUVNIoJ2rnEVI4ptbO1M7Up2gRbF2cSzKLw7w+Z0u5XwbBdaumL50llzRkhBfY27OCajnDlqaFMKEV0JqP8W5RX8ihCDfCzSgv6c55hb9iRCakkB9MnlHhG1WjxZmLedTPutjrIXV4nM+L3wC14hJftc6nU6n81UeZrqT3KzUdj4AAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAZCAYAAABtnU33AAABa0lEQVR4Xu2WjY3CMAxGM8OtwAyscCuwAiuwAhswwo1wG7ABG7DADXDkqXwnY+JApOrUSn6S1TZ1HX/5cVpKkiTJytlUO/hGw2e1U7Xv0vdbNIg4lknEb7Xz4+s/9tV+yuT/Ue2r2uV+vyoQwGxtSywYUYhFtOVapsFaLZFghPKOwbHgi+jVEglm+UaCaY/AH9vdn6kRDB7P2gpcfZva9b36ZRWyGm0eqjs+t7eIBEfC1B51xnu2Aj4sfQoewtj7GPcMJldqCL4IAMQpPlcVStUSYrViDjG3YCApfGxVJ0HfFzOqgbGoDwZAINL7KmYvlyd8EmIOwXa54k+blrrwIoA+/Mz1YvZyeeKVYH8EjQi2RMlFgn1OIzG7RILVgQ8WzbxlJLnFCI72R2u5eUaSW4xguJbHZFRk9qatxUhy/yJYji2zUCU5DuhMxwBHSg8fj2+1DWQ8S4C1Vl6ttijmLOgnQb+iSZIkSTITN6iNtrc5X0dLAAAAAElFTkSuQmCC>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAnklEQVR4Xu2SWw2AMAxFqwELaMACFrCABSzgACk4wA8CoBdSHmNdS8IPyU5yf7qTpt1GlPktJacLiwotZwiLQs3pOSNn4Uz34ygFZ6aEi6aYriJ/0zcDuMSG9s087oYlYm05t9wDS8TauCZguQcpUdYWUu4NTcSEeNArmvtAE1ELA1e+VXuqT7SmMdyuWyTDxV1BiCVG6CDXB8xkvmQFIVc998Z4k2oAAAAASUVORK5CYII=>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAApklEQVR4XuWSXQ2EMBCEVwMW0IAFLGABC1jAAVJwcEowgIBjP5ppduEeeOa+ZELazs72B7MX07gm1+paXG1eLnSuzTVbMVCwJ4eVJJnEx/V19WHuNDAZWw1WUhOkqQ1bSCmCtqTRigOQzpdiiipUY0S0E5jpQtBJNEYoYq7u87GRk2qPEQVw+ZXHRgbXV7i1BlXH67idOi7oGWVK9xjRzzDaj6T/4wBvozHDvt+JHAAAAABJRU5ErkJggg==>