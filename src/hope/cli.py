import argparse
import json

from hope.twitter.stream import start_stream


def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="Hope",
        description="A modular package for visualising Twitter trends",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        epilog="Written by: Akintunde 'theyorubayesian' Oladipo <akin.o.oladipo@gmail.com>"
    )
    parser.add_argument("--config-file", type=str, help="Path to configuration for space")
    parser.add_argument("--verbose", type=bool, default=True, help="If True, print verbose output")

    sub_parser = parser.add_subparsers(dest="command", title="Commands", description="Valid commands")
    stream_parser = sub_parser.add_parser("stream", help="Stream tweets using the Twitter API.")
    stream_parser.add_argument("--keyword-list-file", type=str, help="Path to file containing keywords")
    stream_parser.add_argument("--output-client", default="stdout", nargs=1, choices=["stdout", "file", "mongo"])
    stream_parser.add_argument("--output-file", type=str, help="Path to `output file`. Used with file `output-client`")
    stream_parser.add_argument("--env-file", type=str, help="Path to file containing env vars")

    args, _ = parser.parse_known_args()
    if args.config_file:
        config = json.load(open(args.config_file, "r"))
        args_dict = vars(args)
        args_dict.update(config)
    
    return args


def main():
    args = get_args()

    if args.command == "stream":
        start_stream(
            keyword_list_file=args.keyword_list_file, 
            output_client=args.output_client, 
            output_file=args.output_file, 
            env_file=args.env_file
        )


if __name__ == "__main__":
    main()
