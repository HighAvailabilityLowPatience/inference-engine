import socket
import time
import uuid


def get_node_id():
    return str(uuid.getnode())


def ping_latency(host, port=53, timeout=1):
    """
    Fast, non-root, non-ICMP TCP ping.
    Works reliably on EC2 without sudo.
    """
    start = time.time()
    try:
        socket.setdefaulttimeout(timeout)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((host, port))
        sock.close()
        return round((time.time() - start) * 1000, 2)
    except:
        return None
