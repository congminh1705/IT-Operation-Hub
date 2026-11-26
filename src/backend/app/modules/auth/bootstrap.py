"""One-time first Admin setup. Run only from an authorized operator shell."""

import argparse
import os
from getpass import getpass
from pathlib import Path
from uuid import UUID

from app.infrastructure.database import Database, create_database_engine
from app.modules.auth.service import AuthService


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--authorization", type=UUID, required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--display-name", required=True)
    parser.add_argument("--blocklist", type=Path, required=True)
    args = parser.parse_args()
    blocklist = {
        line.casefold()
        for line in args.blocklist.read_text(encoding="utf-8").splitlines()
        if line
    }
    if not blocklist:
        parser.error("Configure an approved password blocklist.")
    password = getpass("Temporary first-Admin password: ")
    if password != getpass("Confirm password: "):
        parser.error("Passwords do not match.")
    engine = create_database_engine(os.environ["ITOH_DATABASE_DSN"])
    try:
        identifier = AuthService(Database(engine)).bootstrap_admin(
            args.authorization,
            args.email,
            args.display_name,
            password,
            blocklist,
        )
    finally:
        engine.dispose()
    print(f"First Admin created: {identifier}")


if __name__ == "__main__":
    main()
