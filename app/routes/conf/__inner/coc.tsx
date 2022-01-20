export default function CoC() {
  return (
    <div className="text-white">
      <h1 className="font-jet-mono text-m-h1 sm:text-d-h2 xl:text-d-j mb-16">
        Remix Conf Code of Conduct
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg flex flex-col gap-4 mb-6">
        <p>
          All attendees, speakers, sponsors and volunteers at our conference are
          required to agree with the following code of conduct. Organizers will
          enforce this code throughout the event. We are expecting cooperation
          from all participants to help ensuring a safe environment for
          everybody.
        </p>

        <div className="mb-8">
          <h2 className="text-m-h2 sm:tsxt-d-h2 mb-2">The Quick Version</h2>

          <div className="container text-m-p-sm lg:text-d-p-sm flex flex-col gap-4">
            <p>
              Our conference is dedicated to providing a harassment-free
              conference experience for everyone, regardless of gender, gender
              identity and expression, age, sexual orientation, disability,
              physical appearance, body size, race, ethnicity, religion (or lack
              thereof), or technology choices. We do not tolerate harassment of
              conference participants in any form. Sexual language and imagery
              is not appropriate for any conference venue, including talks,
              workshops, parties, Twitter and other online media. Conference
              participants violating these rules may be sanctioned or expelled
              from the conference <em>without a refund</em> at the discretion of
              the conference organizers.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-m-h2 sm:tsxt-d-h2 mb-2">
            The Less Quick Version
          </h2>

          <div className="container text-m-p-sm lg:text-d-p-sm flex flex-col gap-4">
            <p>
              Harassment includes offensive verbal comments related to gender,
              gender identity and expression, age, sexual orientation,
              disability, physical appearance, body size, race, ethnicity,
              religion, technology choices, sexual images in public spaces,
              deliberate intimidation, stalking, following, harassing
              photography or recording, sustained disruption of talks or other
              events, inappropriate physical contact, and unwelcome sexual
              attention.
            </p>

            <p>
              Participants asked to stop any harassing behavior are expected to
              comply immediately.
            </p>

            <p>
              Sponsors are also subject to the anti-harassment policy. In
              particular, sponsors should not use sexualized images, activities,
              or other material. Booth staff (including volunteers) should not
              use sexualized clothing/uniforms/costumes, or otherwise create a
              sexualized environment.
            </p>

            <p>
              If a participant engages in harassing behavior, the conference
              organizers may take any action they deem appropriate, including
              warning the offender or expulsion from the conference with no
              refund.
            </p>

            <p>
              If you are being harassed, notice that someone else is being
              harassed, or have any other concerns, please contact a member of
              conference staff immediately. Conference staff can be identified
              as they&#39;ll be wearing branded t-shirts. Or email{" "}
              <a className="underline" href="mailto:conf+coc@remix.run">
                conf+coc@remix.run
              </a>
              .
            </p>

            <p>
              Conference staff will be happy to help participants contact
              hotel/venue security or local law enforcement, provide escorts, or
              otherwise assist those experiencing harassment to feel safe for
              the duration of the conference. We value your attendance.
            </p>

            <p>
              We expect participants to follow these rules at conference and
              workshop venues and conference-related social events.
            </p>
          </div>
        </div>
      </div>
      <div>
        Adapted from{" "}
        <a className="underline" href="https://confcodeofconduct.com">
          confcodeofconduct.com
        </a>
        .
      </div>
    </div>
  );
}
