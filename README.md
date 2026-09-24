# Clear Approval Flows

KneaWork UX/UI PRD

### Core Specifications
- [Business Requirements & Strategy Specification](../kneawork-business-requirements.md)
- [System Architecture & Technical Design Specification](../kneawork-system-architecture.md)
- [WSA 2027 Submission Requirements & Preparation Plan](../kneawork-wsa-2027-submission-requirements-and-plan.md)


I created the complete PRD covering:

Trust-focused UX principles

Employee, approver, manager, director, and admin experiences

Mobile-first request and approval flows

Request cards, action banners, timelines, audit history, and decision dialogs

Khmer/English localization requirements

shadcn/ui, Radix UI, Tailwind CSS, Lucide, and Next.js architecture

Next.js App Router folder structure

PostgreSQL and modular-monolith architecture

API contracts and workflow state transitions

Telegram integration and security requirements

Accessibility, performance, testing, and product metrics

Phased implementation roadmap and definition of done

The design system recommendation is:

Material Design 3 principles + shadcn/ui open-code components + Radix accessibility primitives + Tailwind design tokens + custom KneaWork approval components.

The most important product rule remains:

Never show only “Pending.” Always show who must act, what they must decide, when it is due, and what happens next.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6ba2c84c-4b92-402e-9903-96c46884bb7b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
