"""add ai usage table

Revision ID: 2a7f5d8a9d11
Revises: 0b702ee20c04
Create Date: 2026-07-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2a7f5d8a9d11"
down_revision: Union[str, Sequence[str], None] = "0b702ee20c04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_usages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("usage_date", sa.Date(), nullable=False),
        sa.Column("request_count", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("user_id", "usage_date", name="uq_ai_usage_user_date"),
    )
    op.create_index(op.f("ix_ai_usages_id"), "ai_usages", ["id"], unique=False)
    op.create_index(op.f("ix_ai_usages_user_id"), "ai_usages", ["user_id"], unique=False)
    op.create_index(op.f("ix_ai_usages_usage_date"), "ai_usages", ["usage_date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_usages_usage_date"), table_name="ai_usages")
    op.drop_index(op.f("ix_ai_usages_user_id"), table_name="ai_usages")
    op.drop_index(op.f("ix_ai_usages_id"), table_name="ai_usages")
    op.drop_table("ai_usages")
