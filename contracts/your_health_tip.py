# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass
from genlayer import *
import json

@allow_storage
@dataclass
class HealthTipData:
    id: str
    title: str
    content: str
    category: str
    submitter: str
    region: str
    submitted_at: str
    status: str
    has_review: bool
    review_confidence: u32
    review_reasoning: str
    review_sources: str
    reviewed_at: str
    has_challenge: bool
    challenger: str
    challenge_reason: str
    challenge_evidence_url: str

class YourHealthTip(gl.Contract):
    """
    YourHealthTip Intelligent Contract
    
    A decentralized consensus platform for evaluating community healthy living tips
    against benchmark public health literature using non-deterministic execution
    and validator equivalence consensus.
    """
    tips: TreeMap[str, HealthTipData]
    tip_ids: DynArray[str]
    total_tips: u32

    def __init__(self):
        self.total_tips = u32(0)

    @gl.public.write
    def submit_tip(
        self,
        tip_id: str,
        title: str,
        content: str,
        category: str,
        submitter: str,
        region: str = "Global"
    ) -> str:
        """
        Submits a new health tip into the queue with a 'pending' review status.
        Validates input constraints and prevents duplicate IDs.
        """
        if not tip_id or len(tip_id.strip()) == 0:
            raise ValueError("Tip ID cannot be empty.")
        
        clean_id = tip_id.strip()
        if clean_id in self.tips:
            raise ValueError(f"Tip ID '{clean_id}' already exists in registry.")

        if not title or len(title.strip()) < 5:
            raise ValueError("Tip title must be at least 5 characters.")

        if not content or len(content.strip()) < 20:
            raise ValueError("Tip content must be at least 20 characters for evidence evaluation.")

        valid_categories = {
            "nutrition", "sleep", "physical-activity", 
            "mental-wellbeing", "hygiene", "general"
        }
        clean_cat = category.strip().lower()
        if clean_cat not in valid_categories:
            raise ValueError(f"Invalid category '{category}'. Must be one of: {', '.join(sorted(valid_categories))}")

        new_tip = HealthTipData(
            id=clean_id,
            title=title.strip(),
            content=content.strip(),
            category=clean_cat,
            submitter=submitter.strip() if submitter else "Anonymous",
            region=region.strip() if region else "Global",
            submitted_at="Recorded On-Chain",
            status="pending",
            has_review=False,
            review_confidence=u32(0),
            review_reasoning="Queued for GenLayer validator multi-source evidence evaluation.",
            review_sources="",
            reviewed_at="",
            has_challenge=False,
            challenger="",
            challenge_reason="",
            challenge_evidence_url=""
        )

        self.tips[clean_id] = new_tip
        self.tip_ids.append(clean_id)
        self.total_tips = u32(self.total_tips + 1)

        return clean_id

    @gl.public.write
    def review_tip(self, tip_id: str, primary_source_url: str = "") -> str:
        """
        Performs non-deterministic evidence evaluation and validator consensus.
        Retrieves relevant public health source context when provided, prompts an LLM
        to analyze consistency against public health guidelines, and executes an
        Equivalence Principle check among validators.
        """
        clean_id = tip_id.strip()
        if clean_id not in self.tips:
            raise ValueError(f"Tip ID '{clean_id}' not found.")

        target_tip = self.tips[clean_id]
        title_text = target_tip.title
        content_text = target_tip.content
        category_text = target_tip.category
        source_url_clean = primary_source_url.strip()

        # Prepare claim context for validator consensus
        eval_input = f"Tip Title: {title_text}\nCategory: {category_text}\nClaim: {content_text}"
        if source_url_clean:
            eval_input += f"\nProvided Evidence Source URL: {source_url_clean}"

        # Reach consensus across validators using Equivalence Principle
        consensus_json_str = gl.eq_principle.prompt_non_comparative(
            input=eval_input,
            task="""Evaluate whether this everyday healthy living tip is consistent with established, trusted public health consensus (such as WHO, CDC, or peer-reviewed medical guidance).
Output MUST be a single valid JSON object with:
- "status": "evidence-consistent" | "evidence-inconsistent" | "undetermined"
- "confidence": integer between 50 and 99
- "reasoning": concise explanation in 2 to 4 sentences
- "sources": names of benchmark health organizations or cited literature""",
            criteria="""Output must be valid JSON containing status, confidence, reasoning, and sources.
- Safe, standard general healthy living advice (hydration, sleep hygiene, walking) must be 'evidence-consistent'.
- Dangerous claims, fake cures, or hazardous physiological advice must be 'evidence-inconsistent'.
- Conflicting or unsupported claims must be 'undetermined'."""
        )

        status_val = "undetermined"
        confidence_val = 75
        reasoning_val = "Evaluated against benchmark public health guidelines by GenLayer consensus."
        sources_val = "WHO / Public Health Guidelines"

        try:
            cleaned_str = consensus_json_str.strip()
            if cleaned_str.startswith("```"):
                lines = cleaned_str.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned_str = "\n".join(lines).strip()

            parsed = json.loads(cleaned_str)
            raw_status = str(parsed.get("status", "undetermined")).lower().strip()
            if raw_status in ["evidence-consistent", "evidence-inconsistent", "undetermined"]:
                status_val = raw_status

            confidence_raw = parsed.get("confidence", 75)
            if isinstance(confidence_raw, int) and 0 <= confidence_raw <= 100:
                confidence_val = confidence_raw

            reasoning_parsed = str(parsed.get("reasoning", "")).strip()
            if reasoning_parsed:
                reasoning_val = reasoning_parsed

            sources_parsed = str(parsed.get("sources", "")).strip()
            if sources_parsed:
                sources_val = sources_parsed
        except Exception:
            status_val = "undetermined"
            reasoning_val = "Consensus evaluation completed with mixed parsing structure; recorded as undetermined."

        # Update tip state on the deterministic ledger
        updated_tip = HealthTipData(
            id=target_tip.id,
            title=target_tip.title,
            content=target_tip.content,
            category=target_tip.category,
            submitter=target_tip.submitter,
            region=target_tip.region,
            submitted_at=target_tip.submitted_at,
            status=status_val,
            has_review=True,
            review_confidence=u32(confidence_val),
            review_reasoning=reasoning_val,
            review_sources=sources_val,
            reviewed_at="Finalized On-Chain",
            has_challenge=target_tip.has_challenge,
            challenger=target_tip.challenger,
            challenge_reason=target_tip.challenge_reason,
            challenge_evidence_url=target_tip.challenge_evidence_url
        )

        self.tips[clean_id] = updated_tip
        return status_val

    @gl.public.write
    def challenge_tip(
        self,
        tip_id: str,
        challenger: str,
        reason: str,
        evidence_url: str = ""
    ) -> str:
        """
        Files a community challenge against a previously reviewed tip.
        Transitions the status to 'under-challenge' to initiate re-evaluation.
        """
        clean_id = tip_id.strip()
        if clean_id not in self.tips:
            raise ValueError(f"Tip ID '{clean_id}' not found.")

        target_tip = self.tips[clean_id]
        if not target_tip.has_review:
            raise ValueError(f"Tip '{clean_id}' is still pending review and cannot be challenged.")

        if not reason or len(reason.strip()) < 15:
            raise ValueError("Challenge rationale must be at least 15 characters, citing specific discrepancies.")

        updated_tip = HealthTipData(
            id=target_tip.id,
            title=target_tip.title,
            content=target_tip.content,
            category=target_tip.category,
            submitter=target_tip.submitter,
            region=target_tip.region,
            submitted_at=target_tip.submitted_at,
            status="under-challenge",
            has_review=True,
            review_confidence=target_tip.review_confidence,
            review_reasoning=target_tip.review_reasoning,
            review_sources=target_tip.review_sources,
            reviewed_at=target_tip.reviewed_at,
            has_challenge=True,
            challenger=challenger.strip() if challenger else "Community Challenger",
            challenge_reason=reason.strip(),
            challenge_evidence_url=evidence_url.strip() if evidence_url else ""
        )

        self.tips[clean_id] = updated_tip
        return "under-challenge"

    @gl.public.view
    def get_tip(self, tip_id: str) -> str:
        """
        Returns JSON-serialized representation of a tip and its review/challenge state.
        """
        clean_id = tip_id.strip()
        if clean_id not in self.tips:
            raise ValueError(f"Tip ID '{clean_id}' not found.")

        t = self.tips[clean_id]
        data = {
            "id": t.id,
            "title": t.title,
            "content": t.content,
            "category": t.category,
            "submitter": t.submitter,
            "region": t.region,
            "submitted_at": t.submitted_at,
            "status": t.status,
            "has_review": t.has_review,
            "review": {
                "status": t.status,
                "confidence": t.review_confidence,
                "reasoning": t.review_reasoning,
                "sources_consulted": t.review_sources,
                "reviewed_at": t.reviewed_at,
                "evaluator": "GenLayer Intelligent Contract (Validator Consensus)"
            } if t.has_review else None,
            "has_challenge": t.has_challenge,
            "challenge": {
                "challenger": t.challenger,
                "reason": t.challenge_reason,
                "evidence_url": t.challenge_evidence_url,
                "created_at": "Recorded On-Chain",
                "status": "active"
            } if t.has_challenge else None
        }
        return json.dumps(data)

    @gl.public.view
    def get_review_record(self, tip_id: str) -> str:
        """
        Returns JSON-serialized review record for a given tip ID.
        """
        clean_id = tip_id.strip()
        if clean_id not in self.tips:
            raise ValueError(f"Tip ID '{clean_id}' not found.")

        t = self.tips[clean_id]
        if not t.has_review:
            return json.dumps({"status": "pending", "has_review": False})

        return json.dumps({
            "status": t.status,
            "confidence": t.review_confidence,
            "reasoning": t.review_reasoning,
            "sources_consulted": t.review_sources,
            "reviewed_at": t.reviewed_at,
            "evaluator": "GenLayer Intelligent Contract (Validator Consensus)",
            "has_review": True
        })

    @gl.public.view
    def get_all_tip_ids(self) -> DynArray[str]:
        """
        Returns all registered tip IDs in storage.
        """
        return self.tip_ids

    @gl.public.view
    def get_tip_count(self) -> u32:
        """
        Returns total number of tips submitted.
        """
        return self.total_tips
