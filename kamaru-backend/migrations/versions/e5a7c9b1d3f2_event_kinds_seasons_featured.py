"""Events: type, season link, featured flag; status normalised; image optional

Revision ID: e5a7c9b1d3f2
Revises: d2f4a6b8c0e3
Create Date: 2026-11-08

Additive columns plus data normalisation:
- status: NULL / 'upcoming' / 'past' -> 'scheduled' (upcoming vs past now comes from the date)
- kind: events titled "...Kamaru Challenge..." -> 'challenge', others 'community'
- season_id: Kamaru Challenge events linked to the season of the same year
"""
from alembic import op
import sqlalchemy as sa


revision = 'e5a7c9b1d3f2'
down_revision = 'd2f4a6b8c0e3'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.add_column(sa.Column('kind', sa.String(length=20), nullable=False, server_default='community'))
        batch_op.add_column(sa.Column('season_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('featured', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.create_index('ix_event_season_id', ['season_id'], unique=False)
        batch_op.create_foreign_key('fk_event_season_id', 'season', ['season_id'], ['id'], ondelete='SET NULL')
        batch_op.alter_column('image_url', existing_type=sa.String(length=500), nullable=True)

    op.execute("UPDATE event SET status = 'scheduled' WHERE status IS NULL OR status IN ('upcoming', 'past')")
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.alter_column('status', existing_type=sa.String(length=20), nullable=False, server_default='scheduled')

    op.execute("UPDATE event SET kind = 'challenge' WHERE LOWER(title) LIKE '%kamaru challenge%'")
    op.execute(
        "UPDATE event SET season_id = (SELECT s.id FROM season s WHERE s.year = CAST(EXTRACT(YEAR FROM event.date_time) AS INTEGER) LIMIT 1) "
        "WHERE kind = 'challenge' AND season_id IS NULL"
    )


def downgrade():
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.alter_column('status', existing_type=sa.String(length=20), nullable=True, server_default=None)
        batch_op.alter_column('image_url', existing_type=sa.String(length=500), nullable=False)
        batch_op.drop_constraint('fk_event_season_id', type_='foreignkey')
        batch_op.drop_index('ix_event_season_id')
        batch_op.drop_column('featured')
        batch_op.drop_column('season_id')
        batch_op.drop_column('kind')
