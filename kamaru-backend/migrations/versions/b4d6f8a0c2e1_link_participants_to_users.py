"""Link participant entries to the user account that submitted them

Revision ID: b4d6f8a0c2e1
Revises: a1c3e5f7b9d2
Create Date: 2026-11-07

"""
from alembic import op
import sqlalchemy as sa


revision = 'b4d6f8a0c2e1'
down_revision = 'a1c3e5f7b9d2'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('participant', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_participant_user_id', ['user_id'], unique=False)
        batch_op.create_foreign_key(
            'fk_participant_user_id_user', 'user', ['user_id'], ['id'], ondelete='SET NULL'
        )

    # Backfill: link existing entries to accounts with the same email.
    # Only unambiguous matches (an email used by exactly one account) are linked.
    op.execute("""
        UPDATE participant p
        SET user_id = u.id
        FROM "user" u
        WHERE lower(trim(u.email)) = lower(trim(p.email))
          AND p.user_id IS NULL
          AND (SELECT count(*) FROM "user" u2 WHERE lower(trim(u2.email)) = lower(trim(p.email))) = 1
    """)


def downgrade():
    with op.batch_alter_table('participant', schema=None) as batch_op:
        batch_op.drop_constraint('fk_participant_user_id_user', type_='foreignkey')
        batch_op.drop_index('ix_participant_user_id')
        batch_op.drop_column('user_id')
