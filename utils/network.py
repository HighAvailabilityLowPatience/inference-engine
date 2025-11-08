def test_latency_and_throughput():
    # Simulate network diagnostics — replace later with actual ICMP/ping + iperf tests
    nodes = ["node-a", "node-b", "node-c"]
    data = []
    for node in nodes:
        latency = round(random.uniform(10, 120), 2)
        throughput = round(random.uniform(50, 950), 2)
        grade = "A" if latency < 50 and throughput > 500 else "B" if throughput > 200 else "C"
        data.append({
            "node": node,
            "latency_ms": latency,
            "throughput_mbps": throughput,
            "grade": grade
        })
    overall = sum([1 if n["grade"] == "A" else 0.5 if n["grade"] == "B" else 0 for n in data]) / len(data)
    return {"nodes": data, "overall_grade": "A" if overall > 0.8 else "B" if overall > 0.5 else "C"}
