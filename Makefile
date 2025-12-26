# Multi-platform Docker build and publish for CyberChef

IMAGE_NAME ?= ghcr.io/mkilijanek/cyberchef
PLATFORMS ?= linux/amd64,linux/arm64
MONTHLY_TAG ?= $(shell date +%Y-%m)
SBOM ?= false
PROVENANCE ?= false

SBOM_FLAG := $(if $(filter true,$(SBOM)),--sbom=true,)
PROVENANCE_FLAG := $(if $(filter true,$(PROVENANCE)),--provenance=true,)

.PHONY: check-branch build publish scan

check-branch:
	@current=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$current" != "main" ]; then \
		echo "Builds must run from the main branch (current: $$current)"; \
		exit 1; \
	fi

build: check-branch
	docker buildx build \
		--pull \
                --platform $(PLATFORMS) \
                --tag $(IMAGE_NAME):latest \
                --tag $(IMAGE_NAME):$(MONTHLY_TAG) \
                $(SBOM_FLAG) \
                $(PROVENANCE_FLAG) \
                --output=type=docker \
                .

publish: check-branch
	docker buildx build \
		--pull \
                --platform $(PLATFORMS) \
                --tag $(IMAGE_NAME):latest \
                --tag $(IMAGE_NAME):$(MONTHLY_TAG) \
                $(SBOM_FLAG) \
                $(PROVENANCE_FLAG) \
                --push \
                .
        $(MAKE) scan

scan:
	docker scout cves $(IMAGE_NAME):latest --only-severity critical,high || true
	@echo "⚠️  Review High/Critical vulnerability findings above."
