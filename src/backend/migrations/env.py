import os

from alembic import context
from sqlalchemy.engine import Connection

from app.infrastructure.database import create_database_engine
from app.infrastructure.models import Base
from app.modules.auth import models as auth_models  # noqa: F401
from app.modules.organization import models as organization_models  # noqa: F401
from app.modules.sla import policy as sla_policy  # noqa: F401
from app.modules.tickets import categories as ticket_categories  # noqa: F401
from app.modules.tickets import models as ticket_models  # noqa: F401
from app.modules.users import provisioning  # noqa: F401


def migrate(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=Base.metadata)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    context.configure(
        dialect_name="postgresql", target_metadata=Base.metadata, literal_binds=True
    )
    with context.begin_transaction():
        context.run_migrations()
else:
    existing = context.config.attributes.get("connection")
    if isinstance(existing, Connection):
        migrate(existing)
    else:
        engine = create_database_engine(os.environ["ITOH_DATABASE_DSN"])
        try:
            with engine.connect() as connection:
                migrate(connection)
        finally:
            engine.dispose()
